import type { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import { z } from "zod";
import { prisma } from "#lib/prisma.ts";
import { type SensorCategory, SensorOrder } from "./sensor-filters.ts";

export const singleSensorDataSchema = z.object({
	id: z.number().int().positive(),
	name: z.string(),
	sensorData: z.array(
		z.object({
			value: z.number(),
			// label: z.string(),
		}),
	),
	currentValue: z.string(),
	minValue: z.number(),
	thresholdWarning: z.union([z.literal("above"), z.literal("below"), z.null()]),
	sensorTypeId: z.number().int().positive(),
});

export async function getSensorsDataImpl({
	sensorId,
	startDate: rawStartDate,
	endDate: rawEndDate,
	query,
	sensorTypeIds,
	category,
	order = SensorOrder.CreatedAt,
	sensorIds,
}: GetSensorsDataOptions) {
	const startDate = rawStartDate ? dayjs(rawStartDate) : dayjs().subtract(1, "week");
	const endDate = rawEndDate ? dayjs(rawEndDate) : null;

	const sensorWhere: Prisma.SensorWhereInput = {};
	if (sensorId) {
		sensorWhere.id = sensorId;
	}

	if (query) {
		sensorWhere.name = {
			contains: query,
		};
	}

	if (sensorTypeIds) {
		sensorWhere.sensorTypeId = {
			in: sensorTypeIds,
		};
	}

	if (sensorIds) {
		sensorWhere.id = {
			in: sensorIds,
		};
	}

	const orderBy: Prisma.SensorOrderByWithRelationInput[] = [];

	switch (order) {
		case SensorOrder.NameAsc:
			orderBy.push({ name: "asc" });
			break;
		case SensorOrder.NameDesc:
			orderBy.push({ name: "desc" });
			break;
		case SensorOrder.TypeAsc:
			orderBy.push({ sensorTypeId: "asc" });
			break;
		case SensorOrder.TypeDesc:
			orderBy.push({ sensorTypeId: "desc" });
			break;
	}

	orderBy.push({ createdAt: "asc" });

	const sensors = await prisma.sensor.findMany({
		where: sensorWhere,
		select: {
			id: true,
			name: true,
			sensorTypeId: true,
			sensorData: {
				select: {
					value: true,
					createdAt: true,
				},
				where: {
					createdAt: {
						gte: startDate.toDate(),
						...(endDate ? { lte: endDate.toDate() } : {}),
					},
				},
				orderBy,
			},
			maxThreshold: true,
			minThreshold: true,
		},
	});

	const sensorTypes = await prisma.sensorType.findMany({
		select: {
			id: true,
			unit: true,
		},
	});

	const sensorTypeUnitsMap = Object.fromEntries(sensorTypes.map((type) => [type.id, type.unit]));

	return sensors.map((sensor) => {
		let lastTimestamp: dayjs.Dayjs | null = null;

		const filteredData = sensor.sensorData.filter((data) => {
			const currentTimestamp = dayjs(data.createdAt);
			if (!lastTimestamp || currentTimestamp.diff(lastTimestamp, "second") >= 180) {
				lastTimestamp = currentTimestamp;
				return true;
			}
			return false;
		});

		const currentValue = sensor.sensorData[sensor.sensorData.length - 1]?.value ?? 0;
		const minValue = sensor.sensorData.reduce((min, data) => Math.min(min, data.value), Number.POSITIVE_INFINITY);

		const thresholdWarning =
			currentValue > sensor.maxThreshold
				? ("above" as const)
				: currentValue < sensor.minThreshold
					? ("below" as const)
					: null;

		return {
			...sensor,
			currentValue: `${currentValue} ${sensorTypeUnitsMap[sensor.sensorTypeId] ?? ""}`,
			minValue,
			sensorData: filteredData.map((data) => ({
				value: data.value,
				// label: dayjs(data.createdAt).format("HH:mm:ss"),
			})),
			thresholdWarning,
		};
	});
}

interface GetSensorsDataOptions {
	sensorId?: number;
	startDate?: string;
	endDate?: string;
	query?: string;
	sensorTypeIds?: number[];
	category?: SensorCategory;
	order?: SensorOrder;
	sensorIds?: number[];
}
