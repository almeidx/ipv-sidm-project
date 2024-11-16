import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import Popover from "react-native-popover-view";
import { BasePage } from "../../components/base-page";
import { Input } from "../../components/input";
import { SensorsFilterPopover } from "../../components/sensors-filter-popover";
import { useSensorFilters } from "../../contexts/sensor-filters-context";
import type { GetSensorsDataResult } from "../../lib/api-types";
import { getSensorIcon } from "../../lib/get-sensor-icon";
import { makeApiRequest } from "../../lib/make-api-request";

const FETCH_SENSORS_DATA_INTERVAL = 3 * 1_000;

export default function Home() {
	const router = useRouter();

	const [sensorsData, setSensorsData] = useState<GetSensorsDataResult["sensors"]>([]);
	const [search, setSearch] = useState("");

	const { categories, order, sensorTypes } = useSensorFilters();

	useEffect(() => {
		async function fetchSensorsData() {
			const pastHour = new Date();
			pastHour.setHours(pastHour.getHours() - 1);

			makeApiRequest<GetSensorsDataResult>("/sensors/data", {
				query: {
					startDate: pastHour.toISOString(),
					query: search,
					categories: categories.join(","),
					order,
					sensorTypes: sensorTypes.join(","),
				},
			}).then(({ data }) => {
				if (data) {
					setSensorsData(data.sensors);
					// toast.loading("Dados atualizados");
				}
			});
		}

		fetchSensorsData();

		const interval = setInterval(fetchSensorsData, FETCH_SENSORS_DATA_INTERVAL);

		return () => clearInterval(interval);
	}, [search, categories, order, sensorTypes]);

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

				<Popover from={<FontAwesome size={24} name="bars" />}>
					<SensorsFilterPopover />
				</Popover>
			</View>

			<View className="flex flex-col w-full mt-4 gap-6">
				{sensorsData.length ? (
					sensorsData.map((sensor) => (
						<TouchableOpacity key={sensor.id} onPress={() => handleSensorClick(sensor.id)}>
							<View className="flex flex-col gap-4 rounded-lg">
								<View className="flex flex-row items-center">
									<View className="flex justify-center items-center mr-3">
										<FontAwesome size={25} name={getSensorIcon(sensor.sensorTypeId)} color="grey" />
									</View>

									<View className="flex flex-col gap-1">
										<Text className="text-xl font-semibold">{sensor.name}</Text>
									</View>

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
