import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { getSensorsDataImpl, singleSensorDataSchema } from "#utils/get-sensors-data.ts";
import { SensorCategory, SensorOrder } from "../../../utils/sensor-filters.ts";

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
					order: z.nativeEnum(SensorOrder).optional(),
					category: z.nativeEnum(SensorCategory).optional(),
					sensors: z
						.string()
						.regex(/^\d+(,\d+)*$/)
						.optional(),
				}),
				response: {
					200: z.object({
						sensors: z.array(singleSensorDataSchema),
					}),
				},
			},
		},
		async (request) => {
			const { startDate, endDate, query, sensorTypes, category, order, sensors } = request.query;

			const sensorTypeIds = sensorTypes?.split(",").map(Number);
			const sensorIds = sensors?.split(",").map(Number);

			const data = await getSensorsDataImpl({
				startDate,
				endDate,
				query,
				sensorTypeIds,
				category,
				order,
				sensorIds,
			});

			return { sensors: data };
		},
	);
};
