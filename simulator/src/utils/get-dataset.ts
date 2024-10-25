import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

export async function getDataset(sensorTypeId: number) {
	switch (sensorTypeId) {
		case 1: {
			const temperatureFile = new URL("../../assets/temperature.csv", import.meta.url);
			return (await readFile(temperatureFile, "utf-8")).split("\n")
		}

		default: {
			assert.fail("Invalid sensor type id");
		}
	}
}
