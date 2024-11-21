import { Prisma } from "@prisma/client";
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
	order = SensorOrder.CreatedAt,
	sensorIds,
	excludeSensorIds,
}: GetSensorsDataOptions) {
	const startDate = rawStartDate
		? dayjs(rawStartDate)
		: dayjs().subtract(1, "week");
	const endDate = rawEndDate ? dayjs(rawEndDate) : undefined;

	const conditions = [];

	if (sensorId) {
		conditions.push(`s.id = ${sensorId}`);
	} else if (sensorIds?.length) {
		conditions.push(`s.id IN (${Prisma.join(sensorIds)})`);
	} else if (excludeSensorIds?.length) {
		conditions.push(`s.id NOT IN (${Prisma.join(excludeSensorIds)})`);
	}

	if (query) {
		conditions.push(`s.name LIKE '%${query}%'`);
	}

	if (sensorTypeIds?.length) {
		conditions.push(`s.sensor_type_id IN (${Prisma.join(sensorTypeIds)})`);
		console.log(conditions);
	}

	conditions.push(`sd.created_at >= ${startDate.valueOf()}`);
	if (endDate) {
		conditions.push(`sd.created_at <= ${endDate.valueOf()}`);
	}

	const whereClause =
		conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

	let orderByClause = "";
	switch (order) {
		case SensorOrder.NameAsc:
			orderByClause = "ORDER BY rd.name ASC";
			break;
		case SensorOrder.NameDesc:
			orderByClause = "ORDER BY rd.name DESC";
			break;
		case SensorOrder.TypeAsc:
			orderByClause = "ORDER BY rd.sensor_type_id ASC";
			break;
		case SensorOrder.TypeDesc:
			orderByClause = "ORDER BY rd.sensor_type_id DESC";
			break;
		default:
			orderByClause = "ORDER BY rd.sensor_created_at ASC";
	}

	const sql = Prisma.sql`
		WITH ranked_data AS (
			SELECT
				s.id,
				s.name,
				s.sensor_type_id,
				s.max_threshold,
				s.min_threshold,
				s.created_at AS sensor_created_at,
				sd.value,
				sd.created_at,
				ROW_NUMBER() OVER (PARTITION BY s.id ORDER BY sd.created_at) as row_num,
				COUNT(*) OVER (PARTITION BY s.id) as total_points
			FROM sensors s
			LEFT JOIN sensor_data sd ON s.id = sd.sensor_id
			${Prisma.raw(whereClause)}
		)
		SELECT
			rd.*,
			st.unit
		FROM ranked_data rd
		LEFT JOIN sensor_types st ON rd.sensor_type_id = st.id
		WHERE (
			row_num = 1
			OR row_num = total_points
			OR (
				row_num > 1
				AND row_num < total_points
				AND (row_num * 5 / CAST(total_points AS FLOAT)) =
					CAST((row_num * 5 / CAST(total_points AS FLOAT)) AS INTEGER)
			)
		)
		${Prisma.raw(orderByClause)}
	`;

	console.log(sql.strings[0]);

	const results =
		await prisma.$queryRaw<
			{
				id: number;
				name: string;
				sensor_type_id: number;
				max_threshold: number;
				min_threshold: number;
				value: number | null;
				created_at: Date;
				unit: string;
			}[]
		>(sql);

	// Process and format results
	const sensorMap = new Map<
		number,
		{
			id: number;
			name: string;
			sensorTypeId: number;
			maxThreshold: number;
			minThreshold: number;
			unit: string;
			sensorData: { value: number; createdAt: Date }[];
			currentValue: string | null;
			minValue: number;
		}
	>();

	for (const row of results) {
		if (!sensorMap.has(row.id)) {
			sensorMap.set(row.id, {
				id: row.id,
				name: row.name,
				sensorTypeId: row.sensor_type_id,
				maxThreshold: row.max_threshold,
				minThreshold: row.min_threshold,
				unit: row.unit,
				sensorData: [],
				currentValue: null,
				minValue: Number.POSITIVE_INFINITY,
			});
		}

		// biome-ignore lint/style/noNonNullAssertion:
		const sensor = sensorMap.get(row.id)!;
		if (row.value !== null) {
			sensor.sensorData.push({
				value: row.value,
				createdAt: row.created_at,
			});
			sensor.minValue = Math.min(sensor.minValue, row.value);
		}
	}

	const res_ = Array.from(sensorMap.values()).map((sensor) => {
		const currentValue = sensor.sensorData.at(-1)?.value ?? 0;
		const thresholdWarning =
			currentValue > sensor.maxThreshold
				? ("above" as const)
				: currentValue < sensor.minThreshold
					? ("below" as const)
					: null;

		return {
			...sensor,
			currentValue: `${currentValue} ${sensor.unit ?? ""}`,
			sensorData: sensor.sensorData.map((data) => ({
				value: data.value,
			})),
			thresholdWarning,
		};
	});

	console.dir(res_, { depth: null });

	return res_;
}

interface GetSensorsDataOptions {
	sensorId?: number;
	startDate?: string | Date;
	endDate?: string;
	query?: string;
	sensorTypeIds?: number[];
	threshold?: "above" | "below";
	order?: SensorOrder;
	sensorIds?: number[];
	excludeSensorIds?: number[];
}
