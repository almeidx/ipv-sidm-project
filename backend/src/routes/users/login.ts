import { compare } from "bcrypt";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "#lib/prisma.ts";

export const login: FastifyPluginAsyncZod = async (app) => {
	app.post(
		"/auth/login",
		{
			schema: {
				body: z.object({
					email: z.string().email(),
					password: z.string().min(12).max(128),
				}),
				response: {
					200: z.object({ token: z.string() }),
					404: z.object({ message: z.string() }),
					401: z.object({ message: z.string() }),
				},
			},
		},

		async (request, reply) => {
			const { email, password } = request.body;

			const user = await prisma.user.findFirst({
				where: {
					email,
				},
			});

			if (!user) {
				throw app.httpErrors.notFound("User not found");
			}

			const passwordValid = await compare(password, user.passwordHash);
			if (!passwordValid) {
				throw app.httpErrors.unauthorized("Invalid password");
			}

			const token = app.jwt.sign({}, { sub: user.id, expiresIn: "1h" });

			return { token };
		},
	);
};
