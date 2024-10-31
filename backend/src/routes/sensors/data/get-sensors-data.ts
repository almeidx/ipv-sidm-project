import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { getSensorsDataImpl } from "#utils/get-sensors-data.ts";

export const getSensorsData: FastifyPluginAsyncZod = async (app) => {
	app.get(
		"/sensors/data",
		{
			schema: {
				querystring: z.object({
					startDate: z.string().datetime().optional(),
					endDate: z.string().datetime().optional(),
				}),
				response: {
					200: z.object({
						sensors: z.array(
							z.object({
								id: z.string().uuid(),
								name: z.string(),
								sensorData: z.record(
									z.string().date(),
									z.object({
										id: z.number().int().positive(),
										value: z.string(),
										createdAt: z.string().datetime(),
									}),
								),
							}),
						),
					}),
				},
			},
		},
		async (request) => {
			const { startDate, endDate } = request.query;
			const data = await getSensorsDataImpl({ startDate, endDate });
			return { sensors: data };
		},
	);
};
