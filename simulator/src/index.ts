import { setInterval } from "node:timers";
import assert from "node:assert/strict";
import { WebSocketMessageType } from "./utils/websocket-message-types.ts";
import { getDataset } from "./utils/get-dataset.ts";

assert(process.env.API_PORT, "API_PORT is required");
assert(process.env.SENSOR_ID, "SENSOR_ID is required");
assert(process.env.SENSOR_TYPE_ID, "SENSOR_TYPE_ID is required");
assert(process.env.SENSOR_TYPE_INDEX, "SENSOR_TYPE_INDEX is required");

const sensorId = process.env.SENSOR_ID;
const sensorTypeId = Number.parseInt(process.env.SENSOR_TYPE_ID, 10);
const sensorTypeIndex = Number.parseInt(process.env.SENSOR_TYPE_INDEX, 10);

const port = Number.parseInt(process.env.API_PORT, 10);
const ws = new WebSocket(`ws://localhost:${port}/ws`);

const SEND_DATA_INTERVAL = 60_000;
const PING_INTERVAL = 4_000;

ws.addEventListener("open", () => {
	console.log("Connected to server");
});

ws.addEventListener("message", async (event) => {
	console.log("Received message from server:", event.data);

	switch (event.data.type) {
		case WebSocketMessageType.Identified: {
			const data = await getDataset(sensorTypeId);
			let index = sensorTypeIndex * (data.length / 5);

			setInterval(() => {
				const value = Number.parseFloat(data[index]);
				if (Number.isNaN(value)) {
					console.warn("Invalid temperature value %s at index %d", data[index], index);
					return;
				}

				ws.send(JSON.stringify({
					type: WebSocketMessageType.Data,
					payload: { sensorId, value: value },
				}));

				index++;
			}, SEND_DATA_INTERVAL);

			setInterval(() => {
				console.log("Sending ping");
				ws.send(JSON.stringify({ type: WebSocketMessageType.Ping }));
			}, PING_INTERVAL).unref();

			break;
		}

		// biome-ignore lint/suspicious/noFallthroughSwitchClause: Intended
		case WebSocketMessageType.Die: {
			ws.close();
			process.exit(0);
		}

		default: {
			console.warn("Unknown message type %s", event.data.type);
			break;
		}
	}
});

ws.addEventListener("close", () => {
	console.log("Disconnected from server");
});

ws.send(JSON.stringify({
	type: WebSocketMessageType.Identify,
	payload: {
		sensorId,
	},
}));
