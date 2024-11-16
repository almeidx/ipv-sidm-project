import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "#lib/prisma.ts";

export const clearNotifications: FastifyPluginAsyncZod = async (app) => {
	app.post(
		"/notifications/clear",
		{
			schema: {
				response: {
					200: z.object({
						count: z.number().int().positive(),
					}),
				},
			},
		},
		async () => {
			const { count } = await prisma.notifications.updateMany({
				data: {
					deletedAt: new Date(),
				},
				where: {
					deletedAt: null,
				},
			});

			return { count };
		},
	);
};