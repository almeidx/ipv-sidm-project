import type { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import { z } from "zod";
import { prisma } from "#lib/prisma.ts";

export const singleSensorDataSchema = z.object({
	id: z.number().int().positive(),
	name: z.string(),
	sensorData: z.record(
		z.string().date(),
		z.record(
			z.string().time(),
			z.object({
				id: z.number().int().positive(),
				value: z.string(),
				createdAt: z.string().datetime(),
			}),
		),
		// z.array(
		// 	z.object({
		// 		id: z.number().int().positive(),
		// 		value: z.string(),
		// 		createdAt: z.string().datetime(),
		// 	}),
		// ),
	),
});

export async function getSensorsDataImpl({
	sensorId,
	startDate: rawStartDate,
	endDate: rawEndDate,
}: GetSensorsDataOptions) {
	const startDate = rawStartDate ? dayjs(rawStartDate) : dayjs().subtract(1, "week");
	const endDate = rawEndDate ? dayjs(rawEndDate) : null;

	const sensorWhere: Prisma.SensorWhereInput = {};
	if (sensorId) {
		sensorWhere.id = sensorId;
	}

	const sensors = await prisma.sensor.findMany({
		where: sensorWhere,
		select: {
			id: true,
			name: true,
			sensorData: {
				select: {
					id: true,
					value: true,
					createdAt: true,
				},
				where: {
					createdAt: {
						gte: startDate.toDate(),
						...(endDate ? { lte: endDate.toDate() } : {}),
					},
				},
				orderBy: {
					createdAt: "asc",
				},
			},
		},
	});

	return sensors.map((sensor) => ({
		...sensor,
		sensorData: sensor.sensorData.reduce(
			(acc, data) => {
				const date = dayjs(data.createdAt).format("YYYY-MM-DD");
				const time = dayjs(data.createdAt)
					.startOf("minute")
					.subtract(dayjs(data.createdAt).minute() % 5, "minute")
					.format("HH:mm:ss");

				acc[date] ??= {};
				(acc[date] as any)[time] ??= {};

				if (
					Object.keys(acc[date][time]).length === 0 ||
					(acc[date][time].createdAt && new Date(acc[date][time].createdAt) < data.createdAt)
				) {
					acc[date][time] = {
						...data,
						createdAt: data.createdAt.toISOString(),
					};
				}

				return acc;
			},
			{} as Record<string, Record<string, Omit<(typeof sensor.sensorData)[0], "createdAt"> & { createdAt: string }>>,
		),
	}));
}

interface GetSensorsDataOptions {
	sensorId?: number;
	startDate?: string;
	endDate?: string;
}
