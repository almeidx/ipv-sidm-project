import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGlobalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { toast } from "sonner-native";
import { BasePage } from "../../../components/base-page";
import type { GetSensorDataResult } from "../../../lib/api-types";
import { CacheKey } from "../../../lib/cache";
import { getSensorIcon } from "../../../lib/get-sensor-icon";
import { makeApiRequest } from "../../../lib/make-api-request";

const timeframes = ["1D", "1W", "1M", "3M", "6M", "1Y", "MAX"] as const;

export default function SensorDetails() {
	const { sensorId } = useGlobalSearchParams<{ sensorId: string }>();
	const [sensorData, setSensorData] = useState<
		GetSensorDataResult["sensor"] | null
	>(null);
	const [isFavorite, setIsFavorite] = useState<boolean>(false);
	const [selectedTimeframe, setSelectedTimeframe] =
		useState<(typeof timeframes)[number]>("1D");

	useEffect(() => {
		async function fetchSensorsData() {
			try {
				if (!sensorId) return;

				const { data } = await makeApiRequest<GetSensorDataResult>(
					`/sensors/${sensorId}/data`,
					{
						query: {
							timeframe: selectedTimeframe,
						},
					},
				);

				if (data) {
					setSensorData(data.sensor);
					console.log(data.sensor);
				}
			} catch (error) {
				console.error("Erro ao buscar dados do sensor:", error);
			}
		}

		async function checkIfFavorite() {
			const favourites = await AsyncStorage.getItem(CacheKey.FavouriteSensors);
			if (!favourites) {
				setIsFavorite(false);
				return;
			}

			const isFavorite = JSON.parse(favourites).includes(sensorId);
			setIsFavorite(!!isFavorite);
		}

		fetchSensorsData();
		checkIfFavorite();
	}, [sensorId, selectedTimeframe]);

	async function handleFavoriteToggle() {
		const newFavoriteStatus = !isFavorite;
		setIsFavorite(newFavoriteStatus);

		const favouritesList = await AsyncStorage.getItem(
			CacheKey.FavouriteSensors,
		);

		if (newFavoriteStatus) {
			toast.success("Sensor adicionado aos favoritos!");

			await AsyncStorage.setItem(
				CacheKey.FavouriteSensors,
				JSON.stringify(
					favouritesList ? [...favouritesList, sensorId] : [sensorId],
				),
			);
		} else {
			toast.success("Sensor removido dos favoritos!");

			if (favouritesList) {
				await AsyncStorage.setItem(
					CacheKey.FavouriteSensors,
					JSON.stringify(
						JSON.parse(favouritesList).filter(
							(item: string) => item !== sensorId,
						),
					),
				);
			}
		}
	}

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
					<Ionicons
						size={32}
						name={isFavorite ? "star" : "star-outline"}
						color={isFavorite ? "#a18b00" : "gray"}
					/>
				</TouchableOpacity>
			}
		>
			<ScrollView>
				<View className="p-4">
					<View className="flex flex-row justify-between items-center">
						<View className="flex gap-2">
							<Text className="text-gray-700 text-md font-semibold">
								{sensorData.name}
							</Text>
							<Text className="text-gray text-4xl font-extrabold">
								{sensorData.currentValue}
							</Text>
						</View>
						<Ionicons
							className="-mr-6"
							size={50}
							name={getSensorIcon(sensorData.sensorTypeId)}
							color="gray"
						/>
					</View>

					{sensorData.thresholdWarning && (
						<View className="mt-3 bg-red-100 border-l-4 border-red-500 p-4 rounded-md">
							<Text className="text-red-600 text-sm">
								Aviso:{" "}
								{sensorData.thresholdWarning === "above"
									? "Acima do limite"
									: "Abaixo do limite"}
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
						curved
						yAxisOffset={sensorData.minValue}
						color={sensorData.thresholdWarning === null ? "green" : "red"}
					/>
				</View>

				<View className="flex-row justify-between">
					{timeframes.map((timeframe) => (
						<TouchableOpacity
							key={timeframe}
							className={`px-3 py-1.5 rounded-md ${
								selectedTimeframe === timeframe ? "bg-slate-600" : "bg-gray-400"
							}`}
							onPress={() => setSelectedTimeframe(timeframe)}
						>
							<Text
								className={`text-white ${
									selectedTimeframe === timeframe
										? "text-white"
										: "text-gray-700"
								}`}
							>
								{timeframe}
							</Text>
						</TouchableOpacity>
					))}
				</View>

				<View>
					<Text className="text-gray-700 text-md font-semibold mt-4">
						Intervalos de valores no último dia
					</Text>

					<View className="flex flex-col mt-2 bg-white p-4 rounded-md shadow">
						<View className="flex flex-row justify-between">
							{/* Valor Mínimo */}
							<Text className="text-blue-900 font-bold">
								Mínimo: {sensorData.minPastDay}
							</Text>
							{/* Valor Máximo */}
							<Text className="text-green-900 font-bold">
								Máximo: {sensorData.maxPastDay}
							</Text>
						</View>

						{/* Barra de intervalo */}
						<View className="relative mt-4 h-4 bg-gray-200 rounded-full">
							{/* Marcador do Mínimo */}
							<View className="absolute w-4 h-4 bg-blue-500 rounded-full" />
							{/* Marcador da Média */}
							<View
								style={{
									left: `${((sensorData.avgPastDay - sensorData.minPastDay) / (sensorData.maxPastDay - sensorData.minPastDay)) * 100}%`,
								}}
								className="absolute w-4 h-4 bg-gray-500 rounded-full"
							/>
							{/* Marcador do Máximo */}
							<View
								style={{ left: "96%" }}
								className="absolute w-4 h-4 bg-green-500 rounded-full"
							/>
						</View>

						{/* Mostrar valores na barra */}
						<View className="flex flex-row justify-between text-xs mt-2">
							<Text className="text-blue-900">{sensorData.minPastDay}</Text>
							<Text className="text-gray-500">
								Média: {sensorData.avgPastDay?.toFixed(2)}
							</Text>
							<Text className="text-green-900">{sensorData.maxPastDay}</Text>
						</View>
					</View>

					<Text className="text-gray-700 text-md font-semibold mt-6">
						Intervalos de valores na última semana
					</Text>

					<View className="flex flex-col mt-2 bg-white p-4 rounded-md shadow">
						<View className="flex flex-row justify-between">
							{/* Valor Mínimo */}
							<Text className="text-blue-900 font-bold">
								Mínimo: {sensorData.minPastWeek}
							</Text>
							{/* Valor Máximo */}
							<Text className="text-green-900 font-bold">
								Máximo: {sensorData.maxPastWeek}
							</Text>
						</View>

						{/* Barra de intervalo */}
						<View className="relative mt-4 h-4 bg-gray-200 rounded-full">
							{/* Marcador do Mínimo */}
							<View className="absolute w-4 h-4 bg-blue-500 rounded-full" />
							{/* Marcador da Média */}
							<View
								style={{
									left: `${((sensorData.avgPastWeek - sensorData.minPastWeek) / (sensorData.maxPastWeek - sensorData.minPastWeek)) * 100}%`,
								}}
								className="absolute w-4 h-4 bg-gray-500 rounded-full"
							/>
							{/* Marcador do Máximo */}
							<View
								style={{ left: "100%" }}
								className="absolute w-4 h-4 bg-green-500 rounded-full"
							/>
						</View>

						{/* Mostrar valores na barra */}
						<View className="flex flex-row justify-between text-xs mt-2">
							<Text className="text-blue-900">{sensorData.minPastWeek}</Text>
							<Text className="text-gray-500">
								Média: {sensorData.avgPastWeek?.toFixed(2)}
							</Text>
							<Text className="text-green-900">{sensorData.maxPastWeek}</Text>
						</View>
					</View>
				</View>
			</ScrollView>
		</BasePage>
	);
}
