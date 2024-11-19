import type { FastifyReply, FastifyRequest } from "fastify";

export async function isAuthenticated(request: FastifyRequest, _reply: FastifyReply) {
	await request.jwtVerify();
}
