import { WebSocketMessageType } from "#utils/websocket-message-types.ts";

const connections: {
	sensorId: string;
	connectedAt: Date;
	lastPingAt: Date;
	connection: WebSocket;
}[] = [];

export const MAX_PING_TIME = 10_000;

export function getConnection(sensorId: string) {
	return connections.find((d) => d.sensorId === sensorId);
}

export function addConnection(sensorId: string, connection: WebSocket) {
	const existingConnection = getConnection(sensorId);
	if (existingConnection) {
		console.warn("Closing existing connection for sensor:", sensorId);
		killSensorConnection(existingConnection.sensorId);
	}

	const now = new Date();
	connections.push({ sensorId, connectedAt: now, lastPingAt: now, connection });
}

export function removeConnection(sensorId: string) {
	const index = connections.findIndex((d) => d.sensorId === sensorId);
	if (index !== -1) {
		connections.splice(index, 1);
	}
}

export function killConnection(sensorId: string): void;
export function killConnection(socket: WebSocket): void;
export function killConnection(arg: string | WebSocket) {
	if (typeof arg === "string") {
		killSensorConnection(arg);
	} else {
		killSocketConnection(arg);
	}
}

function killSensorConnection(sensorId: string) {
	const connection = getConnection(sensorId);
	if (!connection) {
		console.warn("killSensorConnection: Connection not found for sensor:", sensorId);
		return;
	}

	try {
		connection.connection.send(JSON.stringify({ type: WebSocketMessageType.Die }));
		connection.connection.close();
	} catch (error) {
		console.error("Failed to kill sensor connection:", error);
	}

	if (sensorId) {
		removeConnection(sensorId);
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

export function validateSensorConnection(socket: WebSocket, sensorId: string | null): sensorId is string {
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

	if (device.lastPingAt.getTime() < Date.now() - MAX_PING_TIME) {
		console.warn("Device %s has not pinged in 10 seconds", sensorId);
		killConnection(device.sensorId);
		return false;
	}

	return true;
}

setInterval(() => {
	const now = new Date();

	for (const device of [...connections]) {
		if (device.lastPingAt.getTime() < now.getTime() - MAX_PING_TIME) {
			console.warn("Device %s has not pinged in 10 seconds, killing connection", device.sensorId);

			killSensorConnection(device.sensorId);
		}
	}
}, 5_000).unref();

export interface WebSocketMessage {
	type: WebSocketMessageType;
	payload?: unknown;
}
