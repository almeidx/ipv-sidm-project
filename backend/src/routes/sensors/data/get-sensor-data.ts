import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { getSensorsDataImpl } from "#utils/get-sensors-data.ts";

export const getSensorData: FastifyPluginAsyncZod = async (app) => {
	app.get(
		"/sensors/:sensorId/data",
		{
			schema: {
				params: z.object({
					sensorId: z.string().uuid(),
				}),
				querystring: z.object({
					sensorId: z.string().uuid().optional(),
					startDate: z.string().datetime().optional(),
					endDate: z.string().datetime().optional(),
				}),
				response: {
					200: z.object({
						sensor: z.object({
							id: z.string().uuid(),
							name: z.string(),
							sensorData: z.record(
								z.string().date(),
								z.object({
									id: z.number().int().positive(),
									value: z.string(),
									createdAt: z.string().datetime(),
									user: z.object({
										name: z.string(),
									}),
								}),
							),
						}),
					}),
					404: z.object({ message: z.string() }),
				},
			},
		},
		async (request) => {
			const { sensorId } = request.params;
			const { startDate, endDate } = request.query;

			const data = await getSensorsDataImpl({ sensorId, startDate, endDate });
			if (!data.length) {
				throw app.httpErrors.notFound("Sensor not found");
			}

			return { sensor: data[0] };
		},
	);
};
