import { prisma } from "#lib/prisma.ts";
import { ThresholdStatus } from "#utils/threshold-surpassed-enum.ts";
import { type WebSocketMessage, killConnection, validateSensorConnection } from "./connections.ts";

export async function dataHandler(socket: WebSocket, sensorId: number | null, data: WebSocketMessage) {
	if (!validateSensorConnection(socket, sensorId)) {
		return;
	}

	const payload = data.payload as { value: number };
	if (payload.value === undefined) {
		console.warn("Invalid data message:", data);
		killConnection(sensorId);
		return;
	}

	console.log("Received data:", payload.value);

	await prisma.sensorData.create({
		data: {
			value: payload.value,
			sensorId: sensorId!,
		},
		select: {
			id: true,
		},
	});

	await handleSensorReading(sensorId, payload.value);
}

async function handleSensorReading(sensorId: number, value: number) {
	const pastHour = new Date();
	pastHour.setHours(pastHour.getHours() - 1);

	const sensor = await prisma.sensor.findUniqueOrThrow({
		where: { id: sensorId },
		select: {
			maxThreshold: true,
			minThreshold: true,
			notifications: {
				where: {
					createdAt: { gt: pastHour },
				},
				select: {
					id: true,
					thresholdSurpassed: true,
				},
				orderBy: { createdAt: "desc" },
			},
		},
	});

	const currentStatus = determineThresholdStatus(value, sensor);

	const latestNotification = sensor.notifications[0];
	const statusChanged = !latestNotification || latestNotification.thresholdSurpassed !== currentStatus;

	if (statusChanged) {
		await handleNotifications(sensorId, currentStatus, value);
	}
}

function determineThresholdStatus(value: number, sensor: { minThreshold: number; maxThreshold: number }) {
	if (value < sensor.minThreshold) return ThresholdStatus.Below;
	if (value > sensor.maxThreshold) return ThresholdStatus.Above;
	return ThresholdStatus.Normal;
}

async function handleNotifications(sensorId: number, status: ThresholdStatus, value: number) {
	if (status !== ThresholdStatus.Normal) {
		console.warn("Threshold surpassed:", status === ThresholdStatus.Below ? "below" : "above");
	} else {
		console.log("Value returned to normal range");
	}

	await createNotification(sensorId, status, value);
}

async function createNotification(sensorId: number, status: ThresholdStatus, value: number) {
	await prisma.notifications.create({
		data: {
			sensorId,
			thresholdSurpassed: status,
			value,
		},
	});
}
