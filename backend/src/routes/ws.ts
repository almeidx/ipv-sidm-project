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

    for (const device of [...connectedDevices]) {
        if (device.lastPingAt.getTime() < now.getTime() - MAX_PING_TIME) {
            console.warn("Device %s has not pinged in 10 seconds, killing connection", device.sensorId);
            const index = connectedDevices.findIndex(d => d.sensorId === device.sensorId);
            if (index !== -1) {
                connectedDevices.splice(index, 1);
            }
            try {
                die(device.connection);
            } catch (error) {
                console.error("Error sending die message:", error);
            }
            try {
                device.connection.close();
            } catch (error) {
                console.error("Error closing connection:", error);
            }
        }
    }
}, 5_000).unref();

export const webSocketRoute: FastifyPluginAsyncZod = async (app) => {
    app.get("/ws", { websocket: true }, (socket: WebSocket, _req) => {
        console.log("Client connected");

        let sensorId: string | null = null;

        socket.addEventListener("message", async (messageEvent) => {
            const message = messageEvent.data.toString();
            console.log("Raw message from client:", message);

            try {
                const data = JSON.parse(message) as WebSocketMessage;
                console.log("Parsed message:", data);

                switch (data.type) {
                    case WebSocketMessageType.Identify: {
                        console.log("Received identify message");
                        const payload = data.payload as { sensorId: string };
                        if (!payload.sensorId) {
                            console.warn("Invalid identify message:", data);
                            die(socket);
                            return;
                        }

                        const sensor = await prisma.sensor.findUnique({
                            where: { id: payload.sensorId },
                            select: { id: true },
                        });

                        if (!sensor) {
                            console.warn("Sensor not found:", payload.sensorId);
                            die(socket);
                            return;
                        }

                        // Clean up any existing connection
                        const existingIndex = connectedDevices.findIndex(d => d.sensorId === payload.sensorId);
                        if (existingIndex !== -1) {
                            const existing = connectedDevices[existingIndex];
                            connectedDevices.splice(existingIndex, 1);
                            try {
                                existing.connection.close();
                            } catch (error) {
                                console.error("Error closing existing connection:", error);
                            }
                        }

                        sensorId = payload.sensorId;
                        connectedDevices.push({
                            sensorId: payload.sensorId,
                            connectedAt: new Date(),
                            lastPingAt: new Date(),
                            connection: socket
                        });

                        const response = { type: WebSocketMessageType.Identified };
                        console.log("Sending identified response:", response);
                        socket.send(JSON.stringify(response));
                        break;
                    }

                    case WebSocketMessageType.Ping: {
                        if (!validateIdentified(socket, sensorId)) {
                            return;
                        }

                        const device = connectedDevices.find((device) => device.sensorId === sensorId);
                        if (!device) {
                            console.warn("Device not found for ping:", sensorId);
                            die(socket);
                            return;
                        }

                        device.lastPingAt = new Date();
                        const response = { type: WebSocketMessageType.Pong };
                        console.log("Sending pong response:", response);
                        socket.send(JSON.stringify(response));
                        break;
                    }

                    case WebSocketMessageType.Data: {
                        if (!validateIdentified(socket, sensorId)) {
                            return;
                        }

                        // TODO: value type
                        const payload = data.payload as { value: number };
                        if (payload.value === undefined) {
                            console.warn("Invalid data message:", data);
                            die(socket);
                            return;
                        }

                        console.log("Received data:", payload.value);

                        const device = connectedDevices.find((device) => device.sensorId === sensorId);
                        if (!device) {
                            console.warn("Device not found for data:", sensorId);
                            die(socket);
                            return;
                        }

                        await prisma.sensorData.create({
                            data: {
                                value: payload.value.toString(),
                                sensorId: sensorId!,
                            },
                        });

                        console.log("Data saved to database", payload.value);

                        break;
                    }

                    default: {
                        console.warn("Unknown message type:", data.type);
                        die(socket);
                        break;
                    }
                }
            } catch (error) {
                console.error("Failed to parse or process message:", error);
                die(socket);
            }
        });

        socket.addEventListener("close", () => {
            console.log("Client disconnected, cleaning up...");
            if (sensorId) {
                const index = connectedDevices.findIndex(d => d.sensorId === sensorId);
                if (index !== -1) {
                    connectedDevices.splice(index, 1);
                }
            }
        });
    });
};

function validateIdentified(socket: WebSocket, sensorId: string | null): boolean {
    if (!sensorId) {
        console.warn("Connection not identified");
        die(socket);
        return false;
    }

    const device = connectedDevices.find((device) => device.sensorId === sensorId);

    if (!device) {
        console.warn("Device not found:", sensorId);
        die(socket);
        return false;
    }

    if (device.lastPingAt.getTime() < Date.now() - MAX_PING_TIME) {
        console.warn("Device %s has not pinged in 10 seconds", sensorId);
        die(socket);
        return false;
    }

    return true;
}

function die(socket: WebSocket) {
    socket.send(JSON.stringify({ type: WebSocketMessageType.Die }));
    socket.close();
}

interface WebSocketMessage {
    type: WebSocketMessageType;
    payload?: unknown;
}
