import Checkbox from "expo-checkbox";
import { useEffect, useState } from "react";
import { Dimensions, Text, View } from "react-native";
import { TouchableOpacity } from "react-native";
import type { GetSensorTypesResult } from "../lib/api-types";
import { makeApiRequest } from "../lib/make-api-request";
import { CacheKey, findOrCreate } from "../lib/cache";
import DropdownSelect from "react-native-input-select";

const orderOptions = [
	{ label: "Nome (A-Z)", value: "name-asc" },
	{ label: "Nome (Z-A)", value: "name-desc" },
	{ label: "Tipo (A-Z)", value: "type-asc" },
	{ label: "Tipo (Z-A)", value: "type-desc" },
];

const categoryOptions = [
	{ label: "Favoritos", value: "favorite" },
	{ label: "Não favoritos", value: "not-favorite" },
	{ label: "Acima do limite", value: "above-limit" },
	{ label: "Abaixo do limite", value: "below-limit" },
];

export function SensorsFilterPopover() {
	const [sensorTypes, setSensorTypes] = useState<
		GetSensorTypesResult["sensorTypes"]
	>([]);
	const [selectedSensorTypes, setSelectedSensorTypes] = useState<number[]>([]);
	const [order, setOrder] = useState<string>("type-asc");

	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

	const { width: screenWidth } = Dimensions.get("window");

	useEffect(() => {
		async function getSensorTypes() {
			const sensorTypes = await findOrCreate(
				CacheKey.SensorTypes,
				async () => {
					const { data } =
						await makeApiRequest<GetSensorTypesResult>("/sensors/types");
					// biome-ignore lint/style/noNonNullAssertion: <explanation>
					return data!.sensorTypes;
				},
				30 * 60,
			);

			setSensorTypes(sensorTypes);
		}

		getSensorTypes();
	}, []);

	function handleSensorTypeChange(
		sensorType: GetSensorTypesResult["sensorTypes"][0],
	) {
		const wasSelected = selectedSensorTypes.indexOf(sensorType.id) !== -1;

		if (wasSelected) {
			setSelectedSensorTypes((prev) =>
				prev.filter((id) => id !== sensorType.id),
			);
		} else {
			setSelectedSensorTypes((prev) => [...prev, sensorType.id]);
		}
	}

	return (
		<View
			className="flex flex-col gap-4"
			style={{
				padding: 20,
				width: screenWidth - 30,
			}}
		>
			<View className="flex flex-col gap-3">
				<Text className="text-2xl font-bold">Tipos de sensores</Text>

				<View>
					{sensorTypes.map((sensorType, idx) => (
						<TouchableOpacity
							key={sensorType.id}
							onPress={() => handleSensorTypeChange(sensorType)}
						>
							<View
								className={`flex flex-row items-center py-4 gap-4 ${idx === sensorTypes.length - 1 ? "" : "border-b border-gray-300"}`}
							>
								<Checkbox
									value={selectedSensorTypes.indexOf(sensorType.id) !== -1}
								/>
								<Text className="">{sensorType.name}</Text>
							</View>
						</TouchableOpacity>
					))}
				</View>
			</View>

			<View className="flex flex-col gap-3">
				<Text className="text-2xl font-bold">Ordenação</Text>

				<DropdownSelect
					placeholder="Selecione um método de ordenação"
					options={orderOptions}
					selectedValue={order}
					onValueChange={(value) => setOrder(value as string)}
					primaryColor="black"
					dropdownIconStyle={{
						marginTop: -18,
					}}
					dropdownContainerStyle={{
						height: 40,
						paddingVertical: 10,
						backgroundColor: "rgba(0, 0, 0, 0.1)",
						borderRadius: 10,
						paddingLeft: 10,
					}}
				/>
			</View>

			<View className="flex flex-col gap-3">
				<Text className="text-2xl font-bold">Categorias</Text>

				<View>
					{categoryOptions.map((category, idx) => (
						<TouchableOpacity
							key={category.value}
							onPress={() => {
								const isSelected = selectedCategories.includes(category.value);

								if (isSelected) {
									setSelectedCategories((prev) =>
										prev.filter((v) => v !== category.value),
									);
								} else {
									setSelectedCategories((prev) => [...prev, category.value]);
								}
							}}
						>
							<View
								className={`flex flex-row items-center py-4 gap-4 ${idx === categoryOptions.length - 1 ? "" : "border-b border-gray-300"}`}
							>
								<Checkbox value={selectedCategories.includes(category.value)} />
								<Text>{category.label}</Text>
							</View>
						</TouchableOpacity>
					))}
				</View>
			</View>
		</View>
	);
}
