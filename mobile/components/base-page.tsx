import type { PropsWithChildren } from "react";
import { Image, View, Text, TouchableOpacity } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { FontAwesome } from "@expo/vector-icons";
import { Link } from "expo-router";

interface BasePageProps {
	title?: string;
	isModal?: boolean;
}

export function BasePage({
	children,
	title,
	isModal,
}: PropsWithChildren<BasePageProps>) {
	return (
		<ScrollView
			contentContainerClassName="pt-10"
			contentContainerStyle={{ paddingBottom: 46 }}
		>
			<View className="flex flex-row justify-between items-center px-8">
				{isModal ? (
					<Link href="../">
						<FontAwesome name="arrow-left" size={24} color="black" />
					</Link>
				) : <View />}

				<Image
					source={require("../assets/images/logo-black.png")}
					className="size-40"
				/>

				<View />
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
