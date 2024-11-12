import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "#lib/prisma.ts";

export const markNotificationAsRead: FastifyPluginAsyncZod = async (app) => {
	app.post(
		"/notifications/:id/mark-as-read",
		{
			schema: {
				params: z.object({
					id: z.string().regex(/^\d+$/),
				}),
				response: {
					200: z.null(),
					404: z.object({ message: z.string() }),
				},
			},
		},
		async (req) => {
			const { id } = req.params;
			const notification = await prisma.notifications.findUnique({
				where: { id: Number(id) },
			});

			if (!notification) {
				throw app.httpErrors.notFound("Notification not found");
			}

			await prisma.notifications.update({
				where: { id: Number(id) },
				data: { deletedAt: new Date() },
			});
		},
	);
};
