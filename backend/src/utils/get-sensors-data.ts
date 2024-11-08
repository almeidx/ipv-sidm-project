import type { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import { z } from "zod";
import { prisma } from "#lib/prisma.ts";

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
});

export async function getSensorsDataImpl({
  sensorId,
  startDate: rawStartDate,
  endDate: rawEndDate,
}: GetSensorsDataOptions) {
  const startDate = rawStartDate
    ? dayjs(rawStartDate)
    : dayjs().subtract(1, "week");
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
        orderBy: {
          createdAt: "asc",
        },
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

  const sensorTypeUnitsMap = Object.fromEntries(
    sensorTypes.map((type) => [type.id, type.unit]),
  );

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

    const currentValue = filteredData[filteredData.length - 1]?.value ?? 0;
    const minValue = filteredData.reduce((min, data) => Math.min(min, data.value), Infinity);

		return {
			...sensor,
      currentValue: `${currentValue} ${sensorTypeUnitsMap[sensor.sensorTypeId] ?? ''}`,
      minValue,
			sensorData: filteredData.map((data) => ({
				value: data.value,
				// label: dayjs(data.createdAt).format("HH:mm:ss"),
			})),
		};
	});
}

interface GetSensorsDataOptions {
  sensorId?: number;
  startDate?: string;
  endDate?: string;
}
