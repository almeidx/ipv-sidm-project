import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import {
	getSensorsDataImpl,
	singleSensorDataSchema,
} from "#utils/get-sensors-data.ts";
import { isAuthenticated } from "#middleware/is-authenticated.ts";

const timeframeSchema = z
	.union([
		z.literal("1D"),
		z.literal("1W"),
		z.literal("1M"),
		z.literal("3M"),
		z.literal("6M"),
		z.literal("1Y"),
		z.literal("MAX"),
	])
	.optional();

type Timeframe = Required<z.infer<typeof timeframeSchema>>;

export const getSensorData: FastifyPluginAsyncZod = async (app) => {
	app.get(
		"/sensors/:sensorId/data",
		{
			preHandler: [isAuthenticated],
			schema: {
				params: z.object({
					sensorId: z.string().regex(/^\d+$/),
				}),
				querystring: z.object({
					timeframe: timeframeSchema,
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
			const { timeframe } = request.query;

			const startDate = getStartDate(timeframe);

			const data = await getSensorsDataImpl({ sensorId, startDate });
			if (!data.length) {
				throw app.httpErrors.notFound("Sensor not found");
			}

			return { sensor: data[0] };
		},
	);
};

function getStartDate(timeframe: Timeframe) {
	const startDate = new Date();

	switch (timeframe) {
		case "1D":
			startDate.setDate(startDate.getDate() - 1);
			break;
		case "1W":
			startDate.setDate(startDate.getDate() - 7);
			break;
		case "1M":
			startDate.setMonth(startDate.getMonth() - 1);
			break;
		case "3M":
			startDate.setMonth(startDate.getMonth() - 3);
			break;
		case "6M":
			startDate.setMonth(startDate.getMonth() - 6);
			break;
		case "1Y":
			startDate.setFullYear(startDate.getFullYear() - 1);
			break;
		case "MAX":
			startDate.setFullYear(startDate.getFullYear() - 10);
			break;
	}

	return startDate;
}
