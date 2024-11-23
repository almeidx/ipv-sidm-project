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

	maxThreshold: z.number(),
	minThreshold: z.number(),

	minPastDay: z.number(),
	maxPastDay: z.number(),
	avgPastDay: z.number(),
	stddevPastDay: z.number(),
	minPastWeek: z.number(),
	maxPastWeek: z.number(),
	avgPastWeek: z.number(),
	stddevPastWeek: z.number(),
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
		conditions.push(`s.id IN (${sensorIds.join(", ")})`);
	} else if (excludeSensorIds?.length) {
		conditions.push(`s.id NOT IN (${excludeSensorIds.join(", ")})`);
	}

	if (query) {
		conditions.push(`s.name LIKE '%${query}%'`);
	}

	if (sensorTypeIds?.length) {
		conditions.push(`s.sensor_type_id IN (${sensorTypeIds.join(", ")})`);
		console.log(conditions);
	}

	conditions.push(`sd.created_at >= '${startDate.toISOString()}'`);
	if (endDate) {
		conditions.push(`sd.created_at <= '${endDate.toISOString()}'`);
	}

	const whereClause =
		conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

	const orderByConditions: string[] = [];
	switch (order) {
		case SensorOrder.NameAsc:
			orderByConditions.push("cs.name ASC");
			break;
		case SensorOrder.NameDesc:
			orderByConditions.push("cs.name DESC");
			break;
		case SensorOrder.TypeAsc:
			orderByConditions.push("cs.sensor_type_id ASC");
			break;
		case SensorOrder.TypeDesc:
			orderByConditions.push("cs.sensor_type_id DESC");
			break;
		default:
			orderByConditions.push("cs.sensor_created_at ASC");
			break;
	}

	orderByConditions.push("cs.id ASC");

	const pastDayTimestamp = dayjs().subtract(1, "day");
	const pastWeekTimestamp = dayjs().subtract(1, "week");

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
		),
		calculated_step AS (
			SELECT
				*,
				CASE WHEN (total_points - 1) / 29.0 < 1 THEN 1 ELSE ROUND((total_points - 1) / 29.0) END AS step_size
			FROM ranked_data
		),
		aggregated_day AS (
			SELECT
				sensor_id,
				MIN(value) AS min_past_day,
				MAX(value) AS max_past_day,
				AVG(value) AS avg_past_day,
				STDDEV(value) AS stddev_past_day
			FROM sensor_data
			WHERE created_at >= '${Prisma.raw(pastDayTimestamp.toISOString())}'
			GROUP BY sensor_id
		),
		aggregated_week AS (
			SELECT
				sensor_id,
				MIN(value) AS min_past_week,
				MAX(value) AS max_past_week,
				AVG(value) AS avg_past_week,
				STDDEV(value) AS stddev_past_week
			FROM sensor_data
			WHERE created_at >= '${Prisma.raw(pastWeekTimestamp.toISOString())}'
			GROUP BY sensor_id
		)
		SELECT
			cs.*,
			st.unit,
			ad.min_past_day,
			ad.max_past_day,
			ad.avg_past_day,
			ad.stddev_past_day,
			aw.min_past_week,
			aw.max_past_week,
			aw.avg_past_week,
			aw.stddev_past_week
		FROM calculated_step cs
		INNER JOIN sensor_types st ON cs.sensor_type_id = st.id
		LEFT JOIN aggregated_day ad ON cs.id = ad.sensor_id
		LEFT JOIN aggregated_week aw ON cs.id = aw.sensor_id
		WHERE (
			row_num = 1
			OR row_num = total_points
			OR ((row_num - 1) % step_size = 0)
		)
		ORDER BY ${Prisma.raw(orderByConditions.join(", "))}
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
				min_past_day: number | null;
				max_past_day: number | null;
				avg_past_day: number | null;
				stddev_past_day: number | null;
				min_past_week: number | null;
				max_past_week: number | null;
				avg_past_week: number | null;
				stddev_past_week: number | null;
			}[]
		>(sql);

	const sensorMap = new Map<
		number,
		{
			id: number;
			name: string;
			sensorTypeId: number;
			maxThreshold: number;
			minThreshold: number;
			unit: string;
			sensorData: { value: number }[];
			currentValue: string | null;
			minValue: number;

			minPastDay: number;
			maxPastDay: number;
			avgPastDay: number;
			stddevPastDay: number;
			minPastWeek: number;
			maxPastWeek: number;
			avgPastWeek: number;
			stddevPastWeek: number;
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

				minPastDay: row.min_past_day ?? 0,
				maxPastDay: row.max_past_day ?? 0,
				avgPastDay: row.avg_past_day ?? 0,
				stddevPastDay: row.stddev_past_day ?? 0,
				minPastWeek: row.min_past_week ?? 0,
				maxPastWeek: row.max_past_week ?? 0,
				avgPastWeek: row.avg_past_week ?? 0,
				stddevPastWeek: row.stddev_past_week ?? 0,
			});
		}

		// biome-ignore lint/style/noNonNullAssertion:
		const sensor = sensorMap.get(row.id)!;
		if (row.value !== null) {
			sensor.sensorData.push({
				value: row.value,
				// createdAt: row.created_at,
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
			sensorData: sensor.sensorData,
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
