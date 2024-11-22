import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { toast } from "sonner-native";
import { BasePage } from "../../components/base-page";
import { Input } from "../../components/input";
import type { GetSensorTypesResult } from "../../lib/api-types";
import { makeApiRequest } from "../../lib/make-api-request";
import DropdownSelect from "react-native-input-select";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function CreateSensor() {
	const [name, setName] = useState("");
	const [selectedValue, setSelectedValue] = useState("1");
	const [sensorTypes, setSensorTypes] = useState<
		GetSensorTypesResult["sensorTypes"]
	>([]);
	const [isLoading, setLoading] = useState(true);
	const [maxThreshold, setMaxThreshold] = useState("");
	const [minThreshold, setMinThreshold] = useState("");

	useEffect(() => {
		makeApiRequest<GetSensorTypesResult>("/sensors/types", {
			failMessage: "Failed to fetch sensor types",
		})
			.then(({ data }) => {
				if (data) {
					setSensorTypes(data.sensorTypes);
				}
			})
			.finally(() => {
				setLoading(false);
			});
	}, []);

	async function handleCreate() {
		const maxThresholdNumber = Number(maxThreshold);
		const minThresholdNumber = Number(minThreshold);

		if (maxThresholdNumber <= minThresholdNumber) {
			toast.error("Limite máximo deve ser maior que o limite mínimo");
			return;
		}

		try {
			const { data, response } = await makeApiRequest<{ id: string }>(
				"/sensors",
				{
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
				},
			);

			switch (response.status) {
				case 201: {
					toast.success("Sensor created successfully");
					break;
				}

				case 400: {
					const message = data;
					console.error("Invalid input data", message);
					toast.error("Invalid input data");
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
				<Input placeholder="Nome" value={name} onChangeText={setName} />
				<View className="w-full h-14 rounded-lg bg-white/10 justify-center mt-4 -mb-3">
					<DropdownSelect
						placeholder="Selecione um tipo de sensor"
						options={sensorTypes.map((type) => ({
							label: type.name,
							value: type.id.toString(),
						}))}
						selectedValue={selectedValue}
						onValueChange={(value) => setSelectedValue(value as string)}
						primaryColor="black"
						placeholderStyle={{
							color: "#999999",
							textAlign: "left",
							paddingLeft: 22,
							paddingRight: 20,
						}}
						dropdownContainerStyle={{
							width: "100%", // Largura completa
							height: 50, // Altura equivalente a `h-14` (14 * 4 px)
							borderWidth: 2, // Equivale a `border-2`
							borderColor: "#D1D5DB", // Cor equivalente a `border-gray-300`
							borderRadius: 8, // Equivale a `rounded-lg`
							backgroundColor: "rgba(255, 255, 255, 0.1)", // Fundo transparente
							justifyContent: "center", // Centraliza verticalmente o conteúdo
							margin: 0,
							paddingRight: 3, // Remove margens adicionais
							paddingLeft: 15, // Remove margens adicionais
						}}
						textStyle={{
							color: "black",
							backgroundColor: "transparent",
							textAlign: "center",
							fontSize: 16,
							paddingLeft: 5,
						}}
						dropdownIconStyle={{
							marginTop: -18,
						}}
					/>
				</View>

				<Input
					placeholder="Limite Minimo"
					value={minThreshold}
					onChangeText={setMinThreshold}
					keyboardType="numeric"
				/>

				<Input
					placeholder="Limite Máximo"
					value={maxThreshold}
					onChangeText={setMaxThreshold}
					keyboardType="numeric"
				/>

				<TouchableOpacity
					className="flex flex-row gap-3 items-center justify-center bg-zinc-300 rounded-3xl w-11/12 h-14"
					onPress={handleCreate}
				>
					<Ionicons size={25} name="add-circle-outline" />
					<Text className="text-black text-xl font-bold">Adicionar Sensor</Text>
				</TouchableOpacity>
			</View>
		</BasePage>
	);
}
