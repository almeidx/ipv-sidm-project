import { WebSocketMessageType } from "#utils/websocket-message-types.ts";
import { getConnection, validateSensorConnection } from "./connections.ts";

export async function pingHandler(socket: WebSocket, sensorId: number | null) {
	if (!validateSensorConnection(socket, sensorId)) {
		return;
	}

	const device = getConnection(sensorId)!;
	device.lastPingAt = new Date();

	const response = { type: WebSocketMessageType.Pong };
	socket.send(JSON.stringify(response));
}
