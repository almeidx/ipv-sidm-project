import type { ComponentProps } from "react";
import { TouchableOpacity, Text, View } from "react-native";

export function Button({ title, variant = "filled", ...props }: ButtonProps) {
	const buttonClass = variant === "outline"
		? "border-2 border-black bg-transparent text-black"
		: "bg-zinc-300 text-black";

	return (
		<View className="w-full">
			<TouchableOpacity
				className={`flex items-center justify-center rounded-3xl w-full h-14 ${buttonClass}`}
				{...props}
			>
				<Text className="text-xl font-bold">{title}</Text>
			</TouchableOpacity>
		</View>
	);
}

type ButtonProps = Omit<ComponentProps<typeof TouchableOpacity>, "className"> & {
	title: string;
	variant?: "filled" | "outline";
};
