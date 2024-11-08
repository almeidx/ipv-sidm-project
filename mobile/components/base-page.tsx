import type { PropsWithChildren } from "react";
import { Image, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export function BasePage({ children }: PropsWithChildren) {
	return (
		<ScrollView contentContainerClassName="pt-10" contentContainerStyle={{ paddingBottom: 46 }}>
			<View className="items-center">
				<Image
					source={require("../assets/images/logo-black.png")}
					className="size-40"
				/>
			</View>

			<View className="flex flex-col flex-1 px-8 gap-4" style={{ marginTop: -30 }}>
				{children}
			</View>
		</ScrollView>
	);
}
