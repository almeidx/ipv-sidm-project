import type FontAwesome from "@expo/vector-icons/FontAwesome";
import { ComponentProps } from "react";

export function getSensorIcon(sensorTypeId: number): ComponentProps<typeof FontAwesome>['name'] {
	switch (sensorTypeId) {
		case 1: // Temperature
			return "thermometer-half";

		case 2: // Humidity
			return "tint";

		case 3: // Pressure
			return "compress";

		case 4: // Magnometer
			return "magnet";

		case 5: // Flow Rate
			return "google-wallet";

		default:
			return "question";
	}
}
