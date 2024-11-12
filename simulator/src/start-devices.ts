import { type ChildProcess, spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const devices = [
	{ sensorId: 1, sensorTypeId: 1, indexOfType: 0 },
	{ sensorId: 2, sensorTypeId: 1, indexOfType: 1 },
	{ sensorId: 3, sensorTypeId: 1, indexOfType: 2 },
	{ sensorId: 4, sensorTypeId: 2, indexOfType: 0 },
	{ sensorId: 5, sensorTypeId: 2, indexOfType: 1 },
	{ sensorId: 6, sensorTypeId: 3, indexOfType: 0 },
	{ sensorId: 7, sensorTypeId: 3, indexOfType: 1 },
	{ sensorId: 8, sensorTypeId: 4, indexOfType: 0 },
	{ sensorId: 9, sensorTypeId: 4, indexOfType: 1 },
	{ sensorId: 10, sensorTypeId: 5, indexOfType: 0 },
	{ sensorId: 11, sensorTypeId: 5, indexOfType: 1 },
] satisfies { sensorId: number; sensorTypeId: number; indexOfType: number }[];

console.log("Starting devices...");

const children: ChildProcess[] = [];

for (const { sensorId, sensorTypeId, indexOfType } of devices) {
	const child = spawn("node", ["--experimental-transform-types", "--env-file=.env", "src/index.ts"], {
		env: {
			...process.env,
			SENSOR_ID: sensorId.toString(),
			SENSOR_TYPE_ID: sensorTypeId.toString(),
			SENSOR_TYPE_INDEX: indexOfType.toString(),
		},
		stdio: "inherit",
	});

	children.push(child);

	child
		.on("exit", (code, signal) => console.error(`${sensorId} exited`, { code, signal }))
		.on("error", (err) => console.error(`Device ${sensorId} errored:`, err))
		.on("close", (code, signal) => console.error(`${sensorId} closed`, { code, signal }))
		.on("disconnect", () => console.error(`Device ${sensorId} disconnected`));

	await sleep(random(1_000, 5_000));
}

process.on("SIGINT", () => {
	console.log("Stopping devices...");

	for (const child of children) {
		child.kill();
	}

	process.exit(0);
});

function random(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}
