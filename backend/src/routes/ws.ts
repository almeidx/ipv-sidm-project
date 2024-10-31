import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { WebSocketMessageType } from "#utils/websocket-message-types.ts";
import { type WebSocketMessage, killConnection } from "#ws/connections.ts";
import { dataHandler } from "#ws/data.handler.ts";
import { identifyHandler } from "#ws/identify.handler.ts";
import { pingHandler } from "#ws/ping.handler.ts";

export const webSocketRoute: FastifyPluginAsyncZod = async (app) => {
	app.get("/ws", { websocket: true }, (socket: WebSocket, _req) => {
		console.log("New ws connection");

		let sensorId: string | null = null;

		socket.addEventListener("message", async (messageEvent) => {
			const message = messageEvent.data.toString();

			try {
				const data = JSON.parse(message) as WebSocketMessage;
				console.log("Parsed message:", data);

				switch (data.type) {
					case WebSocketMessageType.Identify: {
						const result = await identifyHandler(socket, data);
						if (result) {
							sensorId = result;
						}

						break;
					}

					case WebSocketMessageType.Ping: {
						await pingHandler(socket, sensorId);
						break;
					}

					case WebSocketMessageType.Data: {
						await dataHandler(socket, sensorId, data);
						break;
					}

					default: {
						console.warn("Unknown message type:", data.type);
						killConnection((sensorId as string) ?? socket);
						break;
					}
				}
			} catch (error) {
				console.error("Failed to parse or process message:", error);
				killConnection((sensorId as string) ?? socket);
			}
		});

		socket.addEventListener("close", () => {
			console.log("Client disconnected, cleaning up...");
			killConnection((sensorId as string) ?? socket);
		});
	});
};
