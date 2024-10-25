import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { setInterval } from "node:timers";
import { WebSocketMessageType } from "../utils/websocket-message-types.ts";
import { prisma } from "../lib/prisma.ts";

const connectedDevices: {
	sensorId: string;
	connectedAt: Date;
	lastPingAt: Date;
	connection: WebSocket;
}[] = [];

const MAX_PING_TIME = 10_000;

setInterval(() => {
	const now = new Date();

	for (const [index, device] of connectedDevices.entries()) {
		if (device.lastPingAt.getTime() < now.getTime() - MAX_PING_TIME) {
			console.warn("Device %s has not pinged in 10 seconds, killing connection", device.sensorId);
			connectedDevices.splice(index, 1);
			device.connection.send(JSON.stringify({ type: WebSocketMessageType.Die }));
		}
	}
}, 5_000);

export const webSocketRoute: FastifyPluginAsyncZod = async (app) => {
	app.get("/ws", { websocket: true }, (connection, req) => {
		console.log("Client connected");

		let sensorId: string | null = null;

		connection.socket.on("message", async (message: string) => {
			console.log("Received message from client:", message);

			try {
				const data = JSON.parse(message) as WebSocketMessage;

				switch (data.type) {
					case WebSocketMessageType.Identify: {
						const payload = data.payload as { sensorId: string };
						if (!payload.sensorId) {
							console.warn("Invalid identify message:", data);
							connection.socket.send(JSON.stringify({ type: WebSocketMessageType.Die }));
							break;
						}

						const sensor = await prisma.sensor.findUnique({
							where: { id: payload.sensorId },
							select: { id: true },
						});

						if (!sensor) {
							console.warn("Sensor not found:", payload.sensorId);
							connection.socket.send(JSON.stringify({ type: WebSocketMessageType.Die }));
							break;
						}

						connectedDevices.push({ sensorId: payload.sensorId, connectedAt: new Date(), lastPingAt: new Date(), connection: connection.socket });
						connection.socket.send(JSON.stringify({ type: WebSocketMessageType.Identified }));

						sensorId = payload.sensorId;

						break;
					}

					case WebSocketMessageType.Ping: {
						if (!validateIdentified(connection.socket, sensorId)) return;

						const device = connectedDevices.find((device) => device.sensorId === sensorId);
						if (!device) {
							connection.socket.send(JSON.stringify({ type: WebSocketMessageType.Die }));
							return;
						}

						device.lastPingAt = new Date();

						break;
					}

					case WebSocketMessageType.Data: {
						if (!validateIdentified(connection.socket, sensorId)) return;

						break;
					}

					default: {
						console.warn("Unknown message type %s", data.type);
						connection.socket.send(JSON.stringify({ type: WebSocketMessageType.Die }));
						break;
					}
				}
			} catch (error) {
				console.error("Failed to parse message:", error);

				connection.socket.send(JSON.stringify({ type: WebSocketMessageType.Die }));
			}
		});

		connection.socket.on("close", () => {
			console.log("Client disconnected");
		});
	});
};

function validateIdentified(connection: WebSocket, sensorId: string | null) {
	if (!sensorId) {
		connection.send(JSON.stringify({ type: WebSocketMessageType.Die }));
		return false;
	}

	const device = connectedDevices.find((device) => device.sensorId === sensorId);

	if (!device) {
		connection.send(JSON.stringify({ type: WebSocketMessageType.Die }));
		return false;
	}

	if (device.lastPingAt.getTime() < Date.now() - MAX_PING_TIME) {
		console.warn("Device %s has not pinged in 10 seconds", sensorId);
		connection.send(JSON.stringify({ type: WebSocketMessageType.Die }));
		return false;
	}

	return true;
}

interface WebSocketMessage {
	type: WebSocketMessageType;
	payload?: unknown;
}
