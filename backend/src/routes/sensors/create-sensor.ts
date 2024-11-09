import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "#lib/prisma.ts";

export const createSensor: FastifyPluginAsyncZod = async (app) => {
	app.post(
		"/sensors",
		{
			schema: {
				body: z.object({
					name: z.string().min(3).max(32),
					sensorType: z.number().int().min(1),
					minThreshold: z.number(),
					maxThreshold: z.number(),
				}).refine((data) => data.minThreshold < data.maxThreshold),
				response: {
					201: z.object({ id: z.number().int().positive() }),
					409: z.object({ message: z.string() }),
				},
			},
		},
		async (request, reply) => {
			const { name, sensorType, minThreshold, maxThreshold } = request.body;

			const existingSensor = await prisma.sensor.findFirst({
				where: {
					name,
				},
				select: {
					id: true,
				},
			});

			if (existingSensor) {
				throw app.httpErrors.conflict("Sensor already exists");
			}

			const sensor = await prisma.sensor.create({
				data: {
					name,
					sensorTypeId: sensorType,
					minThreshold,
					maxThreshold,
				},
				select: {
					id: true,
				},
			});

			reply.statusCode = 201;

			return { id: sensor.id };
		},
	);
};
