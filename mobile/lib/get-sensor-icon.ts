import type Iconicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";

export function getSensorIcon(
	sensorTypeId: number,
): ComponentProps<typeof Iconicons>["name"] {
	switch (sensorTypeId) {
		case 1: // Temperature
			return "thermometer";

		case 2: // Humidity
			return "water";

		case 3: // Pressure
			return "speedometer";

		case 4: // Magnometer
			return "magnet";

		case 5: // Flow Rate
			return "water";

		default:
			return "help";
	}
}
