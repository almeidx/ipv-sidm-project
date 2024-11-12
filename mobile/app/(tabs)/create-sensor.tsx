import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { toast } from "sonner-native";
import { BasePage } from "../../components/base-page";
import { Input } from "../../components/input";
import type { GetSensorTypesResult } from "../../utils/api-types";
import { makeApiRequest } from "../../utils/make-api-request";

export default function CreateSensor() {
	const [name, setName] = useState("");
	const [selectedValue, setSelectedValue] = useState("1");
	const [sensorTypes, setSensorTypes] = useState<GetSensorTypesResult['sensorTypes']>([]);
	const [isLoading, setLoading] = useState(true);
	const [maxThreshold, setMaxThreshold] = useState("");
	const [minThreshold, setMinThreshold] = useState("");

	useEffect(() => {
		makeApiRequest<GetSensorTypesResult>("/sensors/types", { failMessage: "Failed to fetch sensor types" })
			.then(({ data }) => {
				if (data) {
					setSensorTypes(data.sensorTypes);
				}
			})
			.finally(() => {
				setLoading(false);
			})
	}, []);

	async function handleCreate() {
		const maxThresholdNumber = Number(maxThreshold);
		const minThresholdNumber = Number(minThreshold);

		if (maxThresholdNumber <= minThresholdNumber) {
			toast.error("Limite máximo deve ser maior que o limite mínimo");
			return;
		}

		try {
			const { data, response } = await makeApiRequest<{ id: string }>("/sensors", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name,
					sensorType: Number(selectedValue),
					maxThreshold: maxThresholdNumber,
					minThreshold: minThresholdNumber,
				}),
				failMessage: "An error occurred. Please try again later",
			});

			switch (response.status) {
				case 201: {
					toast.success("Sensor created successfully");
					break;
				}

				case 400: {
					const message = data;
					console.error("Invalid input data", message);
					toast.error('Invalid input data');
					break;
				}

				case 404: {
					toast.error("Sensor type not found");
					break;
				}

				default: {
					console.error("Unknown error occurred", response.status);
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
				<Input
					placeholder="Nome"
					value={name}
					onChangeText={setName}
					style={{
						fontSize: 16,
					}}
					placeholderTextColor="black"
				/>
				<View className="w-full h-14 border-2 border-gray-300 rounded-lg bg-white/10 text-black ">
					<RNPickerSelect
						onValueChange={(itemValue) => setSelectedValue(itemValue)}
						items={[
							{
								label: "Selecione um tipo de sensor",
								value: null,
								color: "#999999",
							},
							...sensorTypes.map((type) => ({
								label: type.name,
								value: type.id.toString()
							}))
						]}
						value={selectedValue}
						style={{
							inputIOS: {
								color: "black",
								backgroundColor: "transparent",
								textAlign: "center",
								fontSize: 16,
							},
							inputAndroid: {
								color: "black",
								backgroundColor: "transparent",
								textAlign: "center",
								fontSize: 16,
							},
							placeholder: {
								color: "#999999",
								textAlign: "left",
								paddingLeft: 20,

							},
						}}
						doneText=""
						Icon={() => null}
						placeholder={{}}
					/>
				</View>



				<Input
					placeholder="Limite Minimo"
					value={minThreshold}
					onChangeText={setMinThreshold}
					keyboardType="numeric"
					style={{
						fontSize: 16,
					}}
				/>

				<Input
					placeholder="Limite Máximo"
					value={maxThreshold}
					onChangeText={setMaxThreshold}
					keyboardType="numeric"
					style={{
						fontSize: 16,
					}}
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
