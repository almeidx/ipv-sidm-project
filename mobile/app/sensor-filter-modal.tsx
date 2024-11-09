import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { makeApiRequest } from "../utils/make-api-request";
import type { GetSensorTypesResult } from "../utils/api-types";
import Checkbox from "expo-checkbox";
import { BasePage } from "../components/base-page";
import { TouchableOpacity } from "react-native-gesture-handler";

export default function ModalScreen() {
	const [sensorTypes, setSensorTypes] = useState<
		GetSensorTypesResult["sensorTypes"]
	>([]);
	const [selectedSensorTypes, setSelectedSensorTypes] = useState<number[]>([]);

	useEffect(() => {
		makeApiRequest<GetSensorTypesResult>("/sensors/types").then((data) =>
			setSensorTypes(data.sensorTypes)
		);
	}, []);

	function handleSensorTypeChange(
		sensorType: GetSensorTypesResult["sensorTypes"][0]
	) {
		const wasSelected = selectedSensorTypes.indexOf(sensorType.id) !== -1;

		if (wasSelected) {
			setSelectedSensorTypes(
				selectedSensorTypes.filter((id) => id !== sensorType.id)
			);
		} else {
			setSelectedSensorTypes([...selectedSensorTypes, sensorType.id]);
		}
	}

	return (
		<BasePage isModal>
			<View className="flex flex-col gap-3">
				<Text className="text-2xl font-bold">Tipos de sensores</Text>

				<View>
					{sensorTypes.map((sensorType) => (
						<TouchableOpacity
							key={sensorType.id}
							onPress={() => handleSensorTypeChange(sensorType)}
						>
							<View className="flex flex-row items-center py-4 border-b border-gray-300 gap-4">
								<Checkbox
									value={selectedSensorTypes.indexOf(sensorType.id) !== -1}
								/>
								<Text className="font-semibold">{sensorType.name}</Text>
							</View>
						</TouchableOpacity>
					))}
				</View>
			</View>

			<View className="flex flex-col gap-3">
				<Text className="text-2xl font-bold">Ordenação</Text>
			</View>
		</BasePage>
	);
}
