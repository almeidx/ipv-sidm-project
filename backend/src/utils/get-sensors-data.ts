import type { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import { prisma } from "#lib/prisma.ts";

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
					user: {
						select: {
							name: true,
						},
					},
				},
				where: {
					createdAt: {
						gte: startDate.toDate(),
						...(endDate ? { lte: endDate.toDate() } : {}),
					},
				},
			},
		},
	});

	return sensors.map((sensor) => ({
		...sensor,
		sensorData: sensor.sensorData.reduce(
			(acc, data) => {
				const date = dayjs(data.createdAt).startOf("day").format("YYYY-MM-DD");
				acc[date] = {
					...data,
					createdAt: data.createdAt.toISOString(),
				};
				return acc;
			},
			{} as Record<string, Omit<(typeof sensor.sensorData)[0], "createdAt"> & { createdAt: string }>,
		),
	}));
}

interface GetSensorsDataOptions {
	sensorId?: string;
	startDate?: string;
	endDate?: string;
}
