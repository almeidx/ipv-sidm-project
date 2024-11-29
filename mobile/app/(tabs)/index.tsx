import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import Popover from "react-native-popover-view";
import { BasePage } from "../../components/base-page";
import { Input } from "../../components/input";
import { SensorsFilterPopover } from "../../components/sensors-filter-popover";
import { useSensorFilters } from "../../contexts/sensor-filters-context";
import type { GetSensorsDataResult } from "../../lib/api-types";
import { CacheKey, findOrCreate } from "../../lib/cache";
import { getSensorIcon } from "../../lib/get-sensor-icon";
import { makeApiRequest } from "../../lib/make-api-request";

const FETCH_SENSORS_DATA_INTERVAL = 3 * 1_000;

export default function Home() {
	const router = useRouter();

	const [sensorsData, setSensorsData] = useState<GetSensorsDataResult["sensors"]>([]);
	const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

	const [search, setSearch] = useState("");
	const [favoriteSensors, setFavoriteSensors] = useState<string[]>([]);
	const { order, sensorTypes, favourites, threshold } = useSensorFilters();

	useEffect(() => {
		async function loadFavorites() {
			const favourites = await AsyncStorage.getItem(CacheKey.FavouriteSensors);
			if (favourites) {
				setFavoriteSensors(JSON.parse(favourites));
			}
		}

		async function getData() {
			const sensorTypesData = await findOrCreate(
				CacheKey.SensorsData,
				async function fetchSensorsData() {
					const pastHour = new Date();
					pastHour.setHours(pastHour.getHours() - 1);

					const query: Record<string, string> = {
						startDate: pastHour.toISOString(),
						query: search,
						order,
						sensorTypes: sensorTypes.join(","),
					};

					if (favourites !== null) {
						const sensorIds = await AsyncStorage.getItem(CacheKey.FavouriteSensors);
						if (sensorIds) {
							const key = favourites ? "sensors" : "excludeSensors";
							query[key] = JSON.parse(sensorIds).join(",");
						}
					}

					if (threshold) {
						query.threshold = threshold;
					}

					const { data } = await makeApiRequest<GetSensorsDataResult>("/sensors/data", { query });

					if (data) {
						const sensorIds = JSON.parse((await AsyncStorage.getItem(CacheKey.FavouriteSensors)) || "[]");

						const sensorsWithFavorites = data.sensors.map((sensor) => ({
							...sensor,
							isFavorite: sensorIds.includes(sensor.id),
						}));

						return sensorsWithFavorites;
					}

					return null;
				},
				1,
			);

			if (sensorTypesData) {
				setSensorsData(sensorTypesData);
				setIsInitialLoading(false);
			}
		}

		loadFavorites();
		getData();

		const interval = setInterval(getData, FETCH_SENSORS_DATA_INTERVAL);

		return () => clearInterval(interval);
	}, [search, order, sensorTypes, favourites, threshold]);

	function handleSensorClick(sensorId: number) {
		router.push(`/sensor-details/${sensorId}`);
	}

	return (
		<BasePage
			rightSide={
				<Link href="/create-sensor">
					<Ionicons size={32} name="add-circle-outline" />
				</Link>
			}
		>
			<View className="flex flex-row items-center gap-4 w-full">
				<View className="w-[88%]">
					<Input placeholder="Pesquisar sensor" value={search} onChangeText={(text) => setSearch(text)} />
				</View>

				<Popover from={<Ionicons size={40} name="reorder-four" style={{ marginLeft: -10 }} />}>
					<SensorsFilterPopover />
				</Popover>
			</View>

			<View className="flex flex-col w-full mt-4 gap-6">
				{isInitialLoading ? (
					<ActivityIndicator size="large" color="blue" />
				) : sensorsData.length ? (
					sensorsData.map((sensor) => (
						<TouchableOpacity key={sensor.id} onPress={() => handleSensorClick(sensor.id)}>
							<View className="flex flex-col gap-4 rounded-lg">
								<View className="flex flex-row items-center">
									<View className="flex justify-center items-center mr-3">
										<Ionicons size={25} name={getSensorIcon(sensor.sensorTypeId)} color="grey" />
									</View>

									<View className="flex flex-col gap-1">
										<Text className="text-xl font-semibold">{sensor.name}</Text>
									</View>

									{favoriteSensors.includes(sensor.id.toString()) && (
										<Ionicons size={20} name="star" color="#a18b00" style={{ marginLeft: 8 }} />
									)}

									<View className="ml-auto">
										<Text className="text-lg">{sensor.currentValue}</Text>
									</View>
								</View>

								<View className="w-[107%] -ml-8">
									<LineChart
										adjustToWidth
										data={sensor.sensorData}
										disableScroll
										height={30}
										hideAxesAndRules
										hideDataPoints
										hideRules
										hideYAxisText
										thickness={2}
										yAxisOffset={sensor.minValue}
										curved
										color={sensor.thresholdWarning === null ? "green" : "red"}
									/>
								</View>

								<View className="h-px bg-gray-300 w-full" />
							</View>
						</TouchableOpacity>
					))
				) : (
					<Text>Nenhum sensor encontrado</Text>
				)}
			</View>
		</BasePage>
	);
}
