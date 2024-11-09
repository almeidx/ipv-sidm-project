import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { BasePage } from "../../components/base-page";
import { Input } from "../../components/input";
import type { GetSensorsDataResult } from "../../utils/api-types";
import { getSensorIcon } from "../../utils/get-sensor-icon";
import { makeApiRequest } from "../../utils/make-api-request";

export default function Home() {
	const [data, setData] = useState<GetSensorsDataResult["sensors"]>([]);
	const [search, setSearch] = useState("");

	useEffect(() => {
		const pastHour = new Date();
		pastHour.setHours(pastHour.getHours() - 1);

		makeApiRequest<GetSensorsDataResult>('/sensors/data', {
			query: {
				startDate: pastHour.toISOString(),
			},
		})
			.then((data) => setData(data.sensors))
	}, []);

	if (!data.length) {
		return (
			<BasePage>
				<Text>Loading...</Text>
			</BasePage>
		);
	}

	return (
		<BasePage>
			<View className="flex flex-row items-center gap-4 w-full">
				<View className="w-[88%]">
					<Input
						placeholder="Pesquisar sensor"
						value={search}
						onChangeText={(text) => setSearch(text)}
					/>
				</View>

				<Link href="/sensor-filter-modal">
					<FontAwesome size={24} name="bars" />
				</Link>
			</View>

			{data.map((sensor) => (
				<View
					className="flex gap-4 items-center flex-row bg-slate-200 p-4 rounded-xl h-28 shadow"
					key={sensor.id}
				>
					<FontAwesome size={32} name={getSensorIcon(sensor.sensorTypeId)} />

					<View className="flex flex-col gap-2 w-11/12 mt-4">
						<View className="flex flex-row justify-between">
							<Text className="text-xl">{sensor.name}</Text>
							<Text className="text-xl">{sensor.currentValue}</Text>
						</View>

						<LineChart
							adjustToWidth
							data={sensor.sensorData}
							disableScroll
							height={50}
							hideAxesAndRules
							hideDataPoints
							hideRules
							hideYAxisText
							thickness={2}
							yAxisOffset={sensor.minValue}
							color={sensor.thresholdWarning === null ? "green" : "red"}
						/>
					</View>
				</View>
			))}
		</BasePage>
	);
}

