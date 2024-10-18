import { Image, StyleSheet, View } from "react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedButton } from "@/components/ui/ThemedButton";
import { ThemedList } from "@/components/ui/ThemedList";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";

const valueTypeMap = {
	1: "Temperature",
	2: "Coordinates",
	3: "Number",
};

const sensorsData = [
	{ id: "8d92b402-7743-4aaa-a31e-3fa58dc38154", name: "GPS", valueType: 2 },
	{
		id: "2ce3a249-fde7-4b68-bce1-c81e1d60aece",
		name: "Accelerometer",
		valueType: 2,
	},
	{
		id: "1a7c5bf6-853c-40cb-9d28-2534bf547bce",
		name: "Temperature",
		valueType: 1,
	},
];

export default function SensorsScreen() {
	function createSensor() {
		console.log("Creating sensor...");
	}

	return (
		<ParallaxScrollView headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}>
			<ThemedView style={styles.headerContainer}>
				<ThemedView style={styles.titleContainer}>
					<ThemedText type="title">Sensors</ThemedText>
					<ThemedButton title="Adicionar" onPress={createSensor} />
				</ThemedView>

				<ThemedText type="default">View all the supported sensors for this app</ThemedText>
			</ThemedView>

			<ThemedList
				data={sensorsData}
				renderItem={(item) => (
					<ThemedView>
						<ThemedText style={{ fontWeight: "bold" }}>{item.name}</ThemedText>
						<ThemedText>
							{item.valueType in valueTypeMap ? valueTypeMap[item.valueType as keyof typeof valueTypeMap] : "Unknown"}
						</ThemedText>
					</ThemedView>
				)}
				keyExtractor={(item) => item.id.toString()}
				onItemPress={(item) => console.log("Pressed:", item.name)}
			/>
		</ParallaxScrollView>
	);
}

const styles = StyleSheet.create({
	headerContainer: {
		flexDirection: "column",
		gap: 8,
	},
	titleContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	listContainer: {
		flexDirection: "column",
		gap: 8,
		marginBottom: 8,
	},
	logo: {
		height: 178,
		width: 290,
		bottom: 0,
		left: 0,
		position: "absolute",
		objectFit: "contain",
	},
	listItem: {
		borderRadius: 8,
		padding: 12,
	},
});
