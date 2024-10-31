import { prisma } from "#lib/prisma.ts";
import { type WebSocketMessage, killConnection, validateSensorConnection } from "./connections.ts";

export async function dataHandler(socket: WebSocket, sensorId: string | null, data: WebSocketMessage) {
	if (!validateSensorConnection(socket, sensorId)) {
		return;
	}

	// TODO: value type
	const payload = data.payload as { value: number };
	if (payload.value === undefined) {
		console.warn("Invalid data message:", data);
		killConnection(sensorId);
		return;
	}

	console.log("Received data:", payload.value);

	await prisma.sensorData.create({
		data: {
			value: payload.value.toString(),
			sensorId: sensorId!,
		},
		select: {
			id: true,
		},
	});
}
