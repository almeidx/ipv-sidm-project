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
					sensors: z
						.string()
						.regex(/^\d+(,\d+)*$/)
						.optional(),
					excludeSensors: z
						.string()
						.regex(/^\d+(,\d+)*$/)
						.optional(),
					threshold: z.union([z.literal("above"), z.literal("below")]).optional(),
				}),
				response: {
					200: z.object({
						sensors: z.array(singleSensorDataSchema),
					}),
				},
			},
		},
		async (request) => {
			const { startDate, endDate, query, sensorTypes, threshold, order, sensors, excludeSensors } = request.query;

			const sensorTypeIds = sensorTypes?.split(",").map(Number);
			const sensorIds = sensors?.split(",").map(Number);
			const excludeSensorIds = excludeSensors?.split(",").map(Number);

			const data = await getSensorsDataImpl({
				startDate,
				endDate,
				query,
				sensorTypeIds,
				threshold,
				order,
				sensorIds,
				excludeSensorIds,
			});

			return { sensors: data };
		},
	);
};
