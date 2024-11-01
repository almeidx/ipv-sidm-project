import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { getSensorsDataImpl, singleSensorDataSchema } from "#utils/get-sensors-data.ts";

export const getSensorData: FastifyPluginAsyncZod = async (app) => {
	app.get(
		"/sensors/:sensorId/data",
		{
			schema: {
				params: z.object({
					sensorId: z.string().regex(/^\d+$/),
				}),
				querystring: z.object({
					startDate: z.string().datetime().optional(),
					endDate: z.string().datetime().optional(),
				}),
				response: {
					200: z.object({
						sensor: singleSensorDataSchema,
					}),
					404: z.object({ message: z.string() }),
				},
			},
		},
		async (request) => {
			const sensorId = Number.parseInt(request.params.sensorId, 10);
			const { startDate, endDate } = request.query;

			const data = await getSensorsDataImpl({ sensorId, startDate, endDate });
			if (!data.length) {
				throw app.httpErrors.notFound("Sensor not found");
			}

			return { sensor: data[0] };
		},
	);
};
