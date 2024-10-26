import { Link } from "expo-router";
import { Image, View, Text, TextInput, TouchableOpacity } from "react-native";

export default function SignUp() {
	return (
		<View className="flex-1 items-center mt-9 flex flex-col gap-20">
			<Image
				source={require("../../assets/images/logo.png")}
				className="size-40"
			/>
			<View className="flex flex-col gap-4 items-center w-full">
				<View className="flex flex-col w-10/12">
					<Text className="text-lg font-semibold">Name</Text>
					<TextInput
						className="px-4 py-2.5 border-2 border-gray-300 rounded-lg"
						placeholder="Enter your name"
					/>
				</View>

				<View className="flex flex-col w-10/12">
					<Text className="text-lg font-semibold">Username</Text>
					<TextInput
						className="px-4 py-2.5 border-2 border-gray-300 rounded-lg"
						placeholder="Enter your username"
					/>
				</View>

				<View className="flex flex-col w-10/12">
					<Text className="text-lg font-semibold">Password</Text>
					<TextInput
						className="px-4 py-2.5 border-2 border-gray-300 rounded-lg"
						placeholder="Enter your password"
						secureTextEntry={true}
						textContentType="password"
					/>
				</View>

				<View className="flex flex-col w-10/12">
					<Text className="text-lg font-semibold">Confirm Password</Text>
					<TextInput
						className="px-4 py-2.5 border-2 border-gray-300 rounded-lg"
						placeholder="Confirm your password"
						secureTextEntry={true}
						textContentType="password"
					/>
				</View>

				<TouchableOpacity className="bg-blue-800 rounded-lg py-2 px-16 mt-8">
					<Text className="text-center text-white text-lg">Create</Text>
				</TouchableOpacity>

				<Link href="/login" className="mt-20">
					<Text className="text-lg color-cyan-500">Already have an account? Login!</Text>
				</Link>
			</View>
		</View>
	);
}
