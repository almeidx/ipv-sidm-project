import { compare, hash } from "bcrypt";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { env } from "#lib/env.ts";
import { prisma } from "#lib/prisma.ts";

export const loginUser: FastifyPluginAsyncZod = async (app) => {
    app.post(
		"/login",
		{
			schema: {
				body: z.object({
					email: z.string().email(),
					password: z.string().min(12).max(128),
				}),
			},
		},

        async (request, reply) => {
            const { email, password } = request.body;

            const existingUser = await prisma.user.findFirst({
                where: {
                    email,
                },
            });

            if (!existingUser) {
                throw app.httpErrors.notFound("User not found");
            }

            const passwordValid = await compare(password, existingUser.passwordHash);

            if (!passwordValid) {
                throw app.httpErrors.unauthorized("Invalid password");
            }

            const payload = {
                email: existingUser.email,
                name: existingUser.name,
            }

            const token = app.jwt.sign(payload, {
                sub: existingUser.id,
                expiresIn: "1h",
            });

            return { token }
        }
    )
} 