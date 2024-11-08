import { useEffect, useState } from "react";
import { Image, View, Text, TextInput, TouchableOpacity } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { API_URL } from "../../utils/constants";
import { toast } from "sonner-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { BasePage } from "../../components/base-page";
import { Input } from "../../components/input";

export default function Home() {
	const [isLoading, setLoading] = useState(true);
	const [data, setData] = useState<Data["sensors"]>([]);
	const [search, setSearch] = useState("");

	useEffect(() => {
		async function getSensorData() {
			try {
				const query = new URLSearchParams();

				const pastHour = new Date();
				pastHour.setHours(pastHour.getHours() - 1);
				query.set("startDate", pastHour.toISOString());

				const response = await fetch(
					`${API_URL}/sensors/data?${query.toString()}`
				);
				const json = (await response.json()) as Data;

				setData(json.sensors);
			} catch (error) {
				console.error(error);
				toast.error("Failed to load data");
			} finally {
				setLoading(false);
			}
		}

		getSensorData();
	}, []);

	if (isLoading) {
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

				<FontAwesome size={24} name="bars" />
			</View>

			{data.map((sensor) => (
				<View
					className="flex gap-4 items-center flex-row bg-slate-300 p-4 rounded-xl h-28 shadow"
					key={sensor.id}
				>
					<FontAwesome size={32} name="thermometer-half" />

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
						/>
					</View>
				</View>
			))}
		</BasePage>
	);

	// return (
	// 	<View className="flex-1 items-center mt-9 flex flex-col gap-20">
	// 		<Image
	// 			source={require("../../assets/images/logo-black.png")}
	// 			className="size-40"
	// 		/>
	// 		{/* <View className="container mx-auto py-12 flex flex-1 flex-row flex-wrap bg-slate-200"> */}
	// 		<View className="p-4">
	// 			<View className="border border-solid border-cyan-500 p-4 rounded">
	// 				<Text className="text-blue-800 text-bold font-semibold">This is a card</Text>
	// 				<Text className="text-white-400">30ºC</Text>
	// 			</View>
	// 		</View>
	// 		<View className="p-4">
	// 			<View className="border border-solid border-cyan-500 p-4 rounded">
	// 				<Text className="text-blue-800 text-bold font-semibold">This is a card</Text>
	// 				<Text className="text-white-400">40ºN, -7ºW</Text>
	// 			</View>
	// 		</View>
	// 		<View className="p-4">
	// 			<View className="border border-solid border-cyan-500 p-4 rounded">
	// 				<Text className="text-blue-800 text-bold font-semibold">This is a card</Text>
	// 				<Text className="text-white-400">40ºN -7ºW</Text>
	// 			</View>
	// 		</View>
	// 		<View className="p-4">
	// 			<View className="border border-solid border-cyan-500 p-4 rounded">
	// 				<Text className="text-blue-800 text-bold font-semibold">This is a card</Text>
	// 				<Text className="text-white-400">30ºC</Text>
	// 			</View>
	// 		</View>
	// 	</View>
	// )
}

interface Data {
	sensors: {
		id: number;
		name: string;
		sensorData: {
			value: number;
			label: string;
		}[];
		currentValue: string;
		minValue: number;
	}[];
}
