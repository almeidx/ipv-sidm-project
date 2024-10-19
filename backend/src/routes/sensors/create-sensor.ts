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
				}),
				response: {
					201: z.object({ id: z.string().uuid() }),
					409: z.object({ message: z.string() }),
				},
			},
		},
		async (request, reply) => {
			const { name, sensorType } = request.body;

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
