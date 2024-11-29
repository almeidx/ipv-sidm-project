import type { ComponentProps } from "react";
import { TextInput, View, StyleSheet } from "react-native";

export function Input(props: InputProps) {
	return (
		<View className="w-full">
			<TextInput
				className="h-14 border-2 border-gray-300 rounded-lg bg-white/10 text-black text-base"
				style={styles.inputs}
				placeholderTextColor="black"
				{...props}
			/>
		</View>
	);
}

type InputProps = Omit<ComponentProps<typeof TextInput>, "className">;

const styles = StyleSheet.create({
	inputs: {
		borderWidth: 1,
		borderColor: '#d1d5db',
		paddingHorizontal: 20,
	},
});