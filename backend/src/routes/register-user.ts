import { hash } from "bcrypt";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { env } from "#lib/env.ts";
import { prisma } from "#lib/prisma.ts";

export const registerUser: FastifyPluginAsyncZod = async (app) => {
	app.post(
		"/register",
		{
			schema: {
				body: z.object({
					name: z.string().min(3).max(32),
					email: z.string().email(),
					password: z.string().min(12).max(128),
				}),
			},
		},
		async (request, reply) => {
			const { name, email, password } = request.body;

			const existingUser = await prisma.user.findFirst({
				where: {
					email,
				},
			});

			if (existingUser) {
				throw app.httpErrors.conflict("User already exists");
			}

			const passwordHash = await hash(password, env.PASSWORD_SALT);

			const user = await prisma.user.create({
				data: {
					name,
					email,
					passwordHash,
				},
			});

			const payload = {
				email: user.email,
				name: user.name,
			}

			const token = app.jwt.sign(payload, {
				sub: user.id,
				expiresIn: "1h",
			});
			

			return { token }
		},
	);
};
