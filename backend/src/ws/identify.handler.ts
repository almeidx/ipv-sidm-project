import { prisma } from "#lib/prisma.ts";
import { WebSocketMessageType } from "#utils/websocket-message-types.ts";
import { type WebSocketMessage, addConnection, killConnection } from "./connections.ts";

export async function identifyHandler(socket: WebSocket, data: WebSocketMessage) {
	console.log("Received identify message");

	const payload = data.payload as { sensorId: string };
	if (!payload.sensorId) {
		console.warn("Invalid identify message:", data);
		killConnection(socket);
		return;
	}

	const sensor = await prisma.sensor.findUnique({
		where: { id: payload.sensorId },
		select: { id: true },
	});

	if (!sensor) {
		console.warn("Sensor not found:", payload.sensorId);
		killConnection(payload.sensorId);
		return;
	}

	addConnection(payload.sensorId, socket);

	const response = { type: WebSocketMessageType.Identified };
	socket.send(JSON.stringify(response));

	return payload.sensorId;
}
