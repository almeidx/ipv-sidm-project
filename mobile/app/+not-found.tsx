import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
	return (
		<>
			<Stack.Screen options={{ title: "Oops!" }} />
			<View className="flex-1 items-center justify-center p-24">
				<Text className="font-bold text-4xl">This screen doesn't exist.</Text>

				<Link href="/" className="mt-14 py-14">
					<Text className="text-2xl color-blue-400">Go to home screen!</Text>
				</Link>
			</View>
		</>
	);
}
