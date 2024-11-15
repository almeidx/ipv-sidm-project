import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "#lib/prisma.ts";

export const getNotifications: FastifyPluginAsyncZod = async (app) => {
	app.get(
		"/notifications",
		{
			schema: {
				response: {
					200: z.object({
						notifications: z.array(
							z.object({
								id: z.number().positive(),
								createdAt: z.string().datetime(),
								sensor: z.object({
									id: z.number(),
									name: z.string(),
									sensorType: z.object({
										id: z.number(),
										unit: z.string(),
									}),
								}),
								thresholdSurpassed: z.number().int().min(0).max(2),
								value: z.number(),
							}),
						),
					}),
				},
			},
		},
		async () => {
			const notifications = await prisma.notifications.findMany({
				select: {
					id: true,
					createdAt: true,
					sensor: {
						select: {
							id: true,
							name: true,

							sensorType: {
								select: {
									id: true,
									unit: true,
								},
							},
						},
					},
					thresholdSurpassed: true,
					value: true,
				},
				where: {
					deletedAt: null,
				},
				orderBy: {
					createdAt: "desc",
				},
				take: 100,
			});

			return {
				notifications: notifications.map((x) => ({
					...x,
					createdAt: x.createdAt.toISOString(),
				})),
			};
		},
	);
};
