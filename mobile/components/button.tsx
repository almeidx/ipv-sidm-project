import type { ComponentProps } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export function Button({ title, variant = "filled", ...props }: ButtonProps) {
	return (
		<View className="w-full">
			<TouchableOpacity
				className={`flex items-center justify-center rounded-3xl w-full h-14 text-black ${
					variant === "outline" ? "border-2 border-black" : ""
				}`}
				style={{
					backgroundColor: variant === "outline" ? "transparent" : variant === "danger" ? "#f87171" : "#d4d4d8",
					borderWidth: 1,
					borderColor: variant === "outline" ? "#020617" : variant === "danger" ? "#f87171" : "#d4d4d8",
				}}
				{...props}
			>
				<Text className="text-xl font-bold">{title}</Text>
			</TouchableOpacity>
		</View>
	);
}

type ButtonProps = Omit<ComponentProps<typeof TouchableOpacity>, "className"> & {
	title: string;
	variant?: "filled" | "outline" | "danger";
};
