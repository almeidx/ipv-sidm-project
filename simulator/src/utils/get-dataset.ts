import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const filesMap: Record<number, URL> = {
	1: new URL("../../assets/temperature.csv", import.meta.url),
	2: new URL("../../assets/humidity.csv", import.meta.url),
	3: new URL("../../assets/pressure.csv", import.meta.url),
	4: new URL("../../assets/magnometer.csv", import.meta.url),
	// 5: new URL("../../assets/flow-rate.csv", import.meta.url), // ???
};

export async function getDataset(sensorTypeId: number) {
	const file = filesMap[sensorTypeId];
	assert(file, `Invalid sensor type ID: ${sensorTypeId}`);

	const data = await readFile(file, "utf8");
	return data.trim().split("\n");
}
