import { Image, View, Text, TextInput, TouchableOpacity } from "react-native";

export default function CreateSensor() {
	return (
		<View className="flex-1 items-center mt-9 flex flex-col gap-20">
			<Image
				source={require("../../assets/images/logo.png")}
				className="size-40"
			/>

		</View>
	)
}
