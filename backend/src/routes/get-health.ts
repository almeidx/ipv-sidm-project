import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const getHealth: FastifyPluginAsyncZod = async (app) => {
	app.get("/_health", () => "OK");
};
