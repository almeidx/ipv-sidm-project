import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "#lib/prisma.ts";
import { isAuthenticated } from "#middleware/is-authenticated.ts";

export const editCurrentUser: FastifyPluginAsyncZod = async (app) => {
	app.patch(
		"/users/@me",
		{
			preHandler: [isAuthenticated],
			schema: {
				body: z.object({
					name: z.string().min(1).max(128),
					email: z.string().email(),
				}),
				response: {
					200: z.null(),
					409: z.object({ message: z.string() }),
				},
			},
		},
		async (request, reply) => {
			const { sub: userId } = request.user;
			const { name, email } = request.body;

			const user = await prisma.user.findUnique({
				where: {
					id: userId,
				},
				select: {
					name: true,
					email: true,
				},
			});

			if (!user) {
				throw app.httpErrors.internalServerError("User not found");
			}

			if (user.name === name && user.email === email) {
				return null;
			}

			if (user.name !== name) {
				const existingUser = await prisma.user.findFirst({
					where: {
						name,
					},
				});

				if (existingUser) {
					throw app.httpErrors.conflict("Name already in use");
				}
			}

			if (user.email !== email) {
				const existingUser = await prisma.user.findFirst({
					where: {
						email,
					},
				});

				if (existingUser) {
					throw app.httpErrors.conflict("Email already in use");
				}
			}

			await prisma.user.update({
				where: {
					id: userId,
				},
				data: {
					name,
					email,
				},
			});
		},
	);
};
