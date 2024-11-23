import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "#lib/prisma.ts";
import { isAuthenticated } from "#middleware/is-authenticated.ts";

export const deleteAccount: FastifyPluginAsyncZod = async (app) => {
	app.delete(
		"/users/@me",
		{
			preHandler: [isAuthenticated],
			schema: {
				response: {
					200: z.null(),
				},
			},
		},
		async (request, reply) => {
			const { sub: userId } = request.user;

			await prisma.user.delete({
				where: {
					id: userId,
				},
			});
		},
	);
};
