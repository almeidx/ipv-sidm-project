import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "#lib/prisma.ts";
import { isAuthenticated } from "#middleware/is-authenticated.ts";

export const getSensors: FastifyPluginAsyncZod = async (app) => {
	app.get(
		"/sensors",
		{
			preHandler: [isAuthenticated],
			schema: {
				response: {
					200: z.object({
						sensors: z.array(
							z.object({
								id: z.number().int().positive(),
								name: z.string(),
								createdAt: z.string().date(),
							}),
						),
					}),
				},
			},
		},
		async () => {
			const sensors = await prisma.sensor.findMany({
				select: {
					id: true,
					name: true,
					createdAt: true,
				},
			});

			return {
				sensors: sensors.map((sensor) => ({
					...sensor,
					createdAt: sensor.createdAt.toISOString(),
				})),
			};
		},
	);
};
