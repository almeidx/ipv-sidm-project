import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const getStatus: FastifyPluginAsyncZod = async (app) => {
	app.get("/status", () => "OK");
};
