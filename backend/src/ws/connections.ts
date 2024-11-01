import { WebSocketMessageType } from "#utils/websocket-message-types.ts";

const connections = new Map<number, { connectedAt: Date; lastPingAt: Date; socket: WebSocket }>();

export const MAX_PING_TIME = 10_000;

export function getConnection(sensorId: number) {
	return connections.get(sensorId);
}

export function addConnection(sensorId: number, connection: WebSocket) {
	if (connections.has(sensorId)) {
		console.warn("Closing existing connection for sensor:", sensorId);
		killSensorConnection(sensorId);
	}

	const now = new Date();

	connections.set(sensorId, { connectedAt: now, lastPingAt: now, socket: connection });
}

export function killConnection(sensorId: number): void;
export function killConnection(socket: WebSocket): void;
export function killConnection(arg: number | WebSocket) {
	if (typeof arg === "number") {
		killSensorConnection(arg);
	} else {
		killSocketConnection(arg);
	}
}

function killSensorConnection(sensorId: number) {
	const connection = getConnection(sensorId);
	if (!connection) {
		console.warn("killSensorConnection: Connection not found for sensor:", sensorId);
		return;
	}

	try {
		connection.socket.send(JSON.stringify({ type: WebSocketMessageType.Die }));
		connection.socket.close();
	} catch (error) {
		console.error("Failed to kill sensor connection:", error);
	}

	if (sensorId) {
		connections.delete(sensorId);
	}
}

function killSocketConnection(socket: WebSocket) {
	try {
		socket.send(JSON.stringify({ type: WebSocketMessageType.Die }));
		socket.close();
	} catch (error) {
		console.error("Failed to kill connection:", error);
	}
}

export function validateSensorConnection(socket: WebSocket, sensorId: number | null): sensorId is number {
	if (!sensorId) {
		console.warn("Connection not identified");
		killConnection(socket);
		return false;
	}

	const device = getConnection(sensorId);
	if (!device) {
		console.warn("Device not found:", sensorId);
		killConnection(socket);
		return false;
	}

	if (device.lastPingAt.getTime() <= Date.now() - MAX_PING_TIME) {
		console.warn("Device %s has not pinged in 10 seconds", sensorId);
		killConnection(sensorId);
		return false;
	}

	return true;
}

setInterval(() => {
	const now = Date.now();

	for (const [sensorId, device] of connections.entries()) {
		if (device.lastPingAt.getTime() > now - MAX_PING_TIME) {
			continue;
		}

		console.warn("Device %s has not pinged in 10 seconds, killing connection", sensorId);
		killSensorConnection(sensorId);
	}
}, 5_000).unref();

export interface WebSocketMessage {
	type: WebSocketMessageType;
	payload?: unknown;
}
