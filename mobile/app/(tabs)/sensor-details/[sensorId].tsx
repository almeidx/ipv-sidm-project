import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useGlobalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { toast } from "sonner-native";
import { BasePage } from "../../../components/base-page";
import type { GetSensorDataResult } from "../../../lib/api-types";
import { getSensorIcon } from "../../../lib/get-sensor-icon";
import { makeApiRequest } from "../../../lib/make-api-request";

export default function SensorDetails() {
	const { sensorId } = useGlobalSearchParams<{ sensorId: string }>();
	const [sensorData, setSensorData] = useState<GetSensorDataResult["sensor"] | null>(null);
	//const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isFavorite, setIsFavorite] = useState<boolean>(false);

	useEffect(() => {
		async function fetchSensorsData() {
			try {
				if (!sensorId) return;

				const pastHour = new Date();
				pastHour.setHours(pastHour.getHours() - 6);

				const { data } = await makeApiRequest<GetSensorDataResult>(`/sensors/${sensorId}/data`, {
					query: {
						startDate: pastHour.toISOString(),
					},
				});

				if (data) {
					setSensorData(data.sensor);
				}
			} catch (error) {
				console.error("Erro ao buscar dados do sensor:", error);
			}
		}

		fetchSensorsData();
	}, [sensorId]);

	const handleFavoriteToggle = () => {
		const newFavoriteStatus = !isFavorite;
		setIsFavorite(newFavoriteStatus);
		if (newFavoriteStatus) {
			toast.success("Sensor adicionado aos favoritos!");
		} else {
			toast.success("Sensor removido dos favoritos!");
		}
	};

	if (!sensorData) {
		return (
			<BasePage>
				<Text>Sensor não encontrado ou sem dados disponíveis.</Text>
			</BasePage>
		);
	}

	return (
		<BasePage
			rightSide={
				<TouchableOpacity onPress={handleFavoriteToggle}>
					<Ionicons size={32} name={isFavorite ? "star" : "star-outline"} color={isFavorite ? "#FFEB3B" : "gray"} />
				</TouchableOpacity>
			}
		>
			<ScrollView>
				<View className="p-4">
					<View className="flex flex-row justify-between items-center">
						<View className="flex gap-2">
							<Text className="text-gray-700 text-md font-semibold">{sensorData.name}</Text>
							<Text className="text-blue-600 text-4xl font-extrabold">{sensorData.currentValue}</Text>
						</View>
						<FontAwesome size={50} name={getSensorIcon(sensorData.sensorTypeId)} color="gray" />
					</View>

					{sensorData.thresholdWarning && (
						<View className="mt-3 bg-red-100 border-l-4 border-red-500 p-4 rounded-md">
							<Text className="text-red-600 text-sm">
								Aviso: {sensorData.thresholdWarning === "above" ? "Acima do limite" : "Abaixo do limite"}
							</Text>
						</View>
					)}
				</View>

				<View className="w-[107%]">
					<LineChart
						adjustToWidth
						data={sensorData.sensorData}
						disableScroll
						height={200}
						// hideAxesAndRules
						hideDataPoints
						// hideRules
						// hideYAxisText
						thickness={2}
						yAxisOffset={sensorData.minValue}
						color={sensorData.thresholdWarning === null ? "green" : "red"}
					/>
				</View>
			</ScrollView>
		</BasePage>
	);
}
