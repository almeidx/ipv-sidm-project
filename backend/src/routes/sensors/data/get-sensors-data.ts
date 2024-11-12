import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { getSensorsDataImpl, singleSensorDataSchema } from "#utils/get-sensors-data.ts";

export const getSensorsData: FastifyPluginAsyncZod = async (app) => {
	app.get(
		"/sensors/data",
		{
			schema: {
				querystring: z.object({
					startDate: z.string().datetime().optional(),
					endDate: z.string().datetime().optional(),
					query: z.string().optional(),
					sensorTypes: z
						.string()
						.regex(/^\d+(,\d+)*$/)
						.optional(),
					order: z.union([z.literal("asc"), z.literal("desc")]).optional(),
				}),
				response: {
					200: z.object({
						sensors: z.array(singleSensorDataSchema),
					}),
				},
			},
		},
		async (request) => {
			const { startDate, endDate, query, sensorTypes } = request.query;

			const sensorTypeIds = sensorTypes?.split(",").map(Number);

			const data = await getSensorsDataImpl({ startDate, endDate, query, sensorTypeIds });
			return { sensors: data };
		},
	);
};
