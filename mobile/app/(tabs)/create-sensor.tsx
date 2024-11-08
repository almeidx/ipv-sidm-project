import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { API_URL } from "../../utils/constants";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import RNPickerSelect from "react-native-picker-select";
import { toast } from "sonner-native";
import { BasePage } from "../../components/base-page";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Input } from "../../components/input"

export default function CreateSensor() {
	const [name, setName] = useState("");
	const [selectedValue, setSelectedValue] = useState("1");
	const [sensorTypes, setSensorTypes] = useState<GetSensorTypesResult['sensorTypes']>([]);
	const [isLoading, setLoading] = useState(true);
	const [maxThreshold, setMaxThreshold] = useState("");
	const [minThreshold, setMinThreshold] = useState("");

	useEffect(() => {
		getSensorTypes();
	}, []);

	async function handleCreate() {
		try {
			const response = await fetch(`${API_URL}/sensors`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name,
					sensorType: Number(selectedValue),
					maxThreshold: Number(maxThreshold),
					minThreshold: Number(minThreshold),
				}),
			});

			switch (response.status) {
				case 201: {
					const { sensor } = await response.json();
					toast.success("Sensor created successfully");
					break;
				}

				case 400: {
					toast.error("Invalid input data");
					break;
				}

				case 404: {
					toast.error("Sensor type not found");
					break;
				}

				default: {
					console.error("Unknown error occurred", response.status, await response.text());
					toast.error("Unknown error occurred");
					break;
				}
			}
		} catch (error) {
			console.error(error);
			toast.error("An error occurred. Please try again later");
		} finally {
			setLoading(false);
		}
	}

	async function getSensorTypes() {
		try {
			const response = await fetch(`${API_URL}/sensors/types`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch sensor types: ${response.status}`);
			}

			const data = (await response.json()) as GetSensorTypesResult;
			setSensorTypes(data.sensorTypes);
		} catch (error) {
			console.error("Error fetching sensor types:", error);
		} finally {
			setLoading(false);
		}
	}

	if (isLoading) {
		return (
			<BasePage>
				<Text>Loading...</Text>
			</BasePage>
		);
	}

	return (
		<BasePage>
			<View className="flex-1 items-center pt-9 flex flex-col gap-5 h-full">
				<TextInput
					className="w-11/12 px-4 h-14 border-2 border-gray-300 rounded-lg bg-white/10 placeholder:text-black text-black"
					placeholder="Nome"
					textContentType="name"
					value={name}
					placeholderTextColor="black"
					onChangeText={(text) => setName(text)}
					style={{
						fontSize: 16, // Tamanho da fonte igual ao do RNPickerSelect
					}}
				/>

				<View className="w-11/12 h-14 border-2 border-gray-300 rounded-lg bg-white/10 text-black">
					<RNPickerSelect
						onValueChange={(itemValue) => setSelectedValue(itemValue)}
						items={sensorTypes.map((type) => ({ label: type.name, value: type.id.toString() }))}
						value={selectedValue}
						style={{
							inputIOS: {
								color: "black",
								backgroundColor: "transparent",
								textAlign: "center",
								width: "100%",
								fontSize: 16, // Tamanho da fonte igual ao do TextInput
							},
							inputAndroid: {
								color: "black",
								backgroundColor: "transparent",
								textAlign: "center",
								width: "100%",
								fontSize: 16, // Tamanho da fonte igual ao do TextInput
							},
							placeholder: {
								color: "black", // Cor do texto do placeholder
								textAlign: "left",
								paddingLeft: 20,
								fontSize: 16, // Tamanho da fonte igual ao do TextInput
							},
						}}
						placeholder={{ label: "Selecione um tipo de sensor", value: null }}
					/>
				</View>


				<Input
					placeholder="Limite Máximo"
					value={minThreshold}
					onChangeText={setMaxThreshold}
					keyboardType="numeric"
				/>


				<Input
					placeholder="Limite Minimo"
					value={minThreshold}
					onChangeText={setMinThreshold}
					keyboardType="numeric"
				/>

				<TouchableOpacity
					className="flex flex-row gap-3 items-center justify-center bg-zinc-300 rounded-3xl w-11/12 h-14"
					onPress={handleCreate}>
					<FontAwesome size={25} name="plus-circle" />
					<Text className="text-black text-xl font-bold">Adicionar Sensor</Text>
				</TouchableOpacity>
			</View>
		</BasePage>
	);
}

interface GetSensorTypesResult {
	sensorTypes: {
		id: number;
		name: string;
	}[];
}

