import { Image, View, Text, TextInput, TouchableOpacity } from "react-native";

export default function Home() {

	return (
		<View className="flex-1 items-center mt-9 flex flex-col gap-20">
			<Image
				source={require("../../assets/images/logo.png")}
				className="size-40"
			/>
			{/* <View className="container mx-auto py-12 flex flex-1 flex-row flex-wrap bg-slate-200"> */}
			<View className="p-4">
				<View className="border border-solid border-cyan-500 p-4 rounded">
					<Text className="text-blue-800 text-bold font-semibold">This is a card</Text>
					<Text className="text-white-400">30ºC</Text>
				</View>
			</View>
			<View className="p-4">
				<View className="border border-solid border-cyan-500 p-4 rounded">
					<Text className="text-blue-800 text-bold font-semibold">This is a card</Text>
					<Text className="text-white-400">40ºN, -7ºW</Text>
				</View>
			</View>
			<View className="p-4">
				<View className="border border-solid border-cyan-500 p-4 rounded">
					<Text className="text-blue-800 text-bold font-semibold">This is a card</Text>
					<Text className="text-white-400">40ºN -7ºW</Text>
				</View>
			</View>
			<View className="p-4">
				<View className="border border-solid border-cyan-500 p-4 rounded">
					<Text className="text-blue-800 text-bold font-semibold">This is a card</Text>
					<Text className="text-white-400">30ºC</Text>
				</View>
			</View>
		</View>
	)
}
