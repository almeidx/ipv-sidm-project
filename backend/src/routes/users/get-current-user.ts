import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "#lib/prisma.ts";
import { isAuthenticated } from "#middleware/is-authenticated.ts";

export const getCurrentUser: FastifyPluginAsyncZod = async (app) => {
	app.get(
		"/users/@me",
		{
			preHandler: [isAuthenticated],
			schema: {
				response: {
					200: z.object({
						id: z.string().uuid(),
						email: z.string(),
						name: z.string(),
						createdAt: z.string().datetime(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { sub: userId } = request.user;

			const user = await prisma.user.findUnique({
				where: {
					id: userId,
				},
				select: {
					createdAt: true,
					id: true,
					name: true,
					email: true,
				},
			});

			if (!user) {
				throw app.httpErrors.internalServerError("User not found");
			}

			return {
				...user,
				createdAt: user.createdAt.toISOString(),
			};
		},
	);
};
