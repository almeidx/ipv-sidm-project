import assert from "node:assert/strict";
import { setInterval } from "node:timers";
import WebSocket from "ws";
import { getDataset } from "./utils/get-dataset.ts";
import { WebSocketMessageType } from "./utils/websocket-message-types.ts";

assert(process.env.API_PORT, "API_PORT is required");
assert(process.env.SENSOR_ID, "SENSOR_ID is required");
assert(process.env.SENSOR_TYPE_ID, "SENSOR_TYPE_ID is required");
assert(process.env.SENSOR_TYPE_INDEX, "SENSOR_TYPE_INDEX is required");

const sensorId = Number.parseInt(process.env.SENSOR_ID, 10);
const sensorTypeId = Number.parseInt(process.env.SENSOR_TYPE_ID, 10);
const sensorTypeIndex = Number.parseInt(process.env.SENSOR_TYPE_INDEX, 10);

const port = Number.parseInt(process.env.API_PORT, 10);
let ws: WebSocket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 5000;

const SEND_DATA_INTERVAL = 5_000;
const PING_INTERVAL = 4_000;

let dataInterval: NodeJS.Timeout | null = null;
let pingInterval: NodeJS.Timeout | null = null;

function connect() {
	cleanup();

	ws = new WebSocket(`ws://localhost:${port}/ws`);

	ws.on("error", (error) => {
		console.error("WebSocket error:", error);
	});

	ws.on("open", () => {
		console.log("Connected to server");
		reconnectAttempts = 0;

		const identifyMessage = {
			type: WebSocketMessageType.Identify,
			payload: {
				sensorId,
			},
		};
		console.log("Sending identify message:", identifyMessage);
		// biome-ignore lint/style/noNonNullAssertion:
		ws!.send(JSON.stringify(identifyMessage), (error) => {
			console.error("Failed to send identify message:", error);
		});
	});

	ws.on("message", (rawData) => {
		try {
			const messageStr = rawData.toString();
			console.log("Raw message received:", messageStr);

			const message = JSON.parse(messageStr);
			console.log("Parsed message:", message);

			switch (message.type) {
				case WebSocketMessageType.Identified: {
					console.log("Successfully identified with server");
					setupIntervals();
					break;
				}

				case WebSocketMessageType.Pong: {
					console.log("Received pong");
					break;
				}

				// biome-ignore lint/suspicious/noFallthroughSwitchClause: Not a fallthrough
				case WebSocketMessageType.Die: {
					console.log("Received die message");
					cleanup();
					process.exit(0);
				}

				default: {
					console.warn("Unknown message type:", message.type);
					break;
				}
			}
		} catch (error) {
			console.error("Error handling message:", error);
		}
	});

	ws.on("close", (code, reason) => {
		console.log(`Disconnected from server: ${code} ${reason.toString()}`);
		cleanup();

		if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
			console.log(
				`Reconnecting in ${RECONNECT_DELAY}ms... (attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`,
			);
			setTimeout(() => {
				reconnectAttempts++;
				connect();
			}, RECONNECT_DELAY);
		} else {
			console.error("Max reconnection attempts reached");
			process.exit(1);
		}
	});
}

async function setupIntervals() {
	try {
		console.log("Setting up intervals...");
		const data = await getDataset(sensorTypeId);
		let index = sensorTypeIndex * Math.floor(data.length / 5);

		pingInterval = setInterval(() => {
			if (!ws || ws.readyState !== WebSocket.OPEN) {
				console.warn("WebSocket not ready for ping");
				return;
			}

			try {
				console.log("Sending ping");
				ws.send(JSON.stringify({ type: WebSocketMessageType.Ping }));
			} catch (error) {
				console.error("Failed to send ping:", error);
			}
		}, PING_INTERVAL);

		dataInterval = setInterval(() => {
			if (!ws || ws.readyState !== WebSocket.OPEN) {
				console.warn("WebSocket not ready for data");
				return;
			}

			const value = Number.parseFloat(data[index]);
			if (Number.isNaN(value)) {
				console.warn("Invalid value %s at index %d", data[index], index);
				return;
			}

			try {
				const dataMessage = {
					type: WebSocketMessageType.Data,
					payload: { value },
				};
				console.log("Sending data:", dataMessage);
				ws.send(JSON.stringify(dataMessage));
			} catch (error) {
				console.error("Failed to send data:", error);
			}

			index = (index + 1) % data.length;
		}, SEND_DATA_INTERVAL);

		console.log("Intervals set up successfully");
	} catch (error) {
		console.error("Error setting up intervals:", error);
	}
}

function cleanup() {
	console.log("Cleaning up resources...");
	if (dataInterval) {
		clearInterval(dataInterval);
		dataInterval = null;
	}
	if (pingInterval) {
		clearInterval(pingInterval);
		pingInterval = null;
	}
	if (ws && ws.readyState === WebSocket.OPEN) {
		try {
			ws.close();
		} catch (error) {
			console.error("Error closing WebSocket:", error);
		}
	}
}

process.on("SIGINT", () => {
	console.log("Shutting down...");
	cleanup();
	process.exit(0);
});

process.on("SIGTERM", () => {
	console.log("Shutting down...");
	cleanup();
	process.exit(0);
});

connect();
