import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const webSocketRoute: FastifyPluginAsyncZod = async (app) => {
	app.get("/ws", { websocket: true }, (connection, req) => {
		console.log("Client connected");

		connection.socket.on("message", () => {
			console.log("Received message from client:");

			connection.socket.send("Hello from server! Data received.");
		});

		connection.socket.on("close", () => {
			console.log("Client disconnected");
		});
	});
};
