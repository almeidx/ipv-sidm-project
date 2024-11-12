import { useRouter } from "expo-router";
import type { PropsWithChildren } from "react";
import { Image, View, Text, TouchableOpacity, Button, Touchable } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

interface BasePageProps {
	title?: string;
	rightSide?: React.ReactNode;
}

export function BasePage({
	children,
	title,
	rightSide,
}: PropsWithChildren<BasePageProps>) {
	const router = useRouter();

	return (
		<ScrollView
			contentContainerClassName="pt-10"
			contentContainerStyle={{ paddingBottom: 46 }}
		>
			<View className="flex flex-row justify-between items-center" style={{ paddingHorizontal: 20 }}>
				<TouchableOpacity onPress={() => router.push("/")} activeOpacity={1}>
					<Image
						source={require("../assets/images/logo-black.png")}
						className="size-40"
					/>
				</TouchableOpacity>

				{rightSide}
			</View>

			{title ? (
				<View
					className="flex flex-col flex-1 gap-4"
					style={{ paddingHorizontal: 20, marginTop: -40, marginBottom: 30 }}
				>
					<View className="flex flex-row justify-between items-center w-full">
						<Text className="text-2xl font-bold">{title}</Text>
					</View>
				</View>
			) : null}

			<View
				className="flex flex-col flex-1 gap-4"
				style={{ paddingHorizontal: 20, marginTop: -30 }}
			>
				{children}
			</View>
		</ScrollView>
	);
}
