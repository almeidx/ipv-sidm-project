import { type ChildProcess, spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const devices = [
	{ sensorId: "236f02b0-ac71-4b22-b11d-94003fe3d8f5", sensorTypeId: 1, indexOfType: 0 },
	{ sensorId: "19b0e0ab-264f-4b77-8064-6cd68623c08b", sensorTypeId: 1, indexOfType: 1 },
	{ sensorId: "0b5c83fe-4b5b-48bb-b1a8-6e14c3f1b626", sensorTypeId: 1, indexOfType: 2 },
	// { sensorId: "492167c2-619c-439e-b036-bd06c4716909", sensorTypeId: 2, indexOfType: 0 },
	// { sensorId: "5cec1bb9-2dd3-4a6b-9663-660b9637317b", sensorTypeId: 2, indexOfType: 1 },
	// { sensorId: "6bdd123c-f94b-49fc-b525-507213b4e71c", sensorTypeId: 3, indexOfType: 0 },
	// { sensorId: "d61ab837-31df-485b-9564-4dfa87793b75", sensorTypeId: 3, indexOfType: 1 },
	// { sensorId: "0133ad16-5188-458e-a9d5-db7182cba3d0", sensorTypeId: 4, indexOfType: 0 },
	// { sensorId: "25f1537c-1284-4ec3-8faa-23ffd95d5695", sensorTypeId: 4, indexOfType: 1 },
	// { sensorId: "58ccc52f-7deb-46be-a32f-7b9e33530ebc", sensorTypeId: 5, indexOfType: 0 },
	// { sensorId: "373717f3-62e3-488f-a61d-b45695b84243", sensorTypeId: 5, indexOfType: 1 },
] satisfies { sensorId: string; sensorTypeId: number, indexOfType: number }[];

console.log("Starting devices...");

const children: ChildProcess[] = [];

for (const { sensorId, sensorTypeId, indexOfType } of devices) {
	const child = spawn(
		"node",
		["--experimental-transform-types", "--env-file=.env", "src/index.ts"],
		{
			env: {
				...process.env,
				SENSOR_ID: sensorId,
				SENSOR_TYPE_ID: sensorTypeId.toString(),
        SENSOR_TYPE_INDEX: indexOfType.toString(),
			},
			stdio: "inherit",
		},
	);

	children.push(child);

	child
		.on("exit", (code, signal) =>
			console.error(`${sensorId} exited`, { code, signal }),
		)
		.on("error", (err) => console.error(`Device ${sensorId} errored:`, err))
		.on("close", (code, signal) =>
			console.error(`${sensorId} closed`, { code, signal }),
		)
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
