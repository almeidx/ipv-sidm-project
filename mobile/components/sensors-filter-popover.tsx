import Checkbox from "expo-checkbox";
import { useEffect, useState } from "react";
import { Dimensions, Text, View } from "react-native";
import { TouchableOpacity } from "react-native";
import DropdownSelect from "react-native-input-select";
import { useSensorFilters } from "../contexts/sensor-filters-context";
import type { GetSensorTypesResult } from "../lib/api-types";
import { CacheKey, findOrCreate } from "../lib/cache";
import { makeApiRequest } from "../lib/make-api-request";

const orderOptions = [
	{ label: "Data de criação", value: "created-at" },
	{ label: "Nome (A-Z)", value: "name-asc" },
	{ label: "Nome (Z-A)", value: "name-desc" },
	{ label: "Tipo (A-Z)", value: "type-asc" },
	{ label: "Tipo (Z-A)", value: "type-desc" },
];

export function SensorsFilterPopover() {
	const [sensorTypesOptions, setSensorTypesOptions] = useState<
		GetSensorTypesResult["sensorTypes"]
	>([]);

	const {
		order,
		sensorTypes,
		favourites,
		threshold,

		setOrder,
		setSensorTypes,
		setFavorites,
		setThreshold,
	} = useSensorFilters();

	const { width: screenWidth } = Dimensions.get("window");

	useEffect(() => {
		async function getSensorTypes() {
			const sensorTypesData = await findOrCreate(
				CacheKey.SensorTypes,
				async () => {
					const { data } =
						await makeApiRequest<GetSensorTypesResult>("/sensors/types");
					// biome-ignore lint/style/noNonNullAssertion:
					return data!.sensorTypes;
				},
				30 * 60,
			);

			setSensorTypesOptions(sensorTypesData);
		}

		getSensorTypes();
	}, []);

	function handleSensorTypeChange(
		sensorType: GetSensorTypesResult["sensorTypes"][0],
	) {
		const wasSelected = sensorTypes.indexOf(sensorType.id) !== -1;

		if (wasSelected) {
			setSensorTypes((prev) => prev.filter((id) => id !== sensorType.id));
		} else {
			setSensorTypes((prev) => [...prev, sensorType.id]);
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
					{sensorTypesOptions.map((sensorType, idx) => (
						<TouchableOpacity
							key={sensorType.id}
							onPress={() => handleSensorTypeChange(sensorType)}
						>
							<View
								className={`flex flex-row items-center py-4 gap-4 ${idx === sensorTypes.length - 1 ? "" : "border-b border-gray-300"}`}
							>
								<Checkbox value={sensorTypes.indexOf(sensorType.id) !== -1} />
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
					<TouchableOpacity
						onPress={() => setFavorites(favourites === true ? null : true)}
					>
						<View className="flex flex-row items-center py-4 gap-4 border-b border-gray-300">
							<Checkbox value={favourites === true} />
							<Text>Favoritos</Text>
						</View>
					</TouchableOpacity>

					<TouchableOpacity
						onPress={() => setFavorites(favourites === false ? null : false)}
					>
						<View className="flex flex-row items-center py-4 gap-4 border-b border-gray-300">
							<Checkbox value={favourites === false} />
							<Text>Não Favoritos</Text>
						</View>
					</TouchableOpacity>

					<TouchableOpacity
						onPress={() => setThreshold(threshold === "above" ? null : "above")}
					>
						<View className="flex flex-row items-center py-4 gap-4 border-b border-gray-300">
							<Checkbox value={threshold === "above"} />
							<Text>Acima do Limite</Text>
						</View>
					</TouchableOpacity>

					<TouchableOpacity
						onPress={() => setThreshold(threshold === "below" ? null : "below")}
					>
						<View className="flex flex-row items-center py-4 gap-4 border-b border-gray-300">
							<Checkbox value={threshold === "below"} />
							<Text>Abaixo do Limite</Text>
						</View>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}
