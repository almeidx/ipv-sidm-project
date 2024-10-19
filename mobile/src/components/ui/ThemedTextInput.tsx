import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { StyleSheet, Text, TextInput, type TextInputProps, View } from "react-native";

export type ThemedTextInputProps = TextInputProps & {
	lightColor?: string;
	darkColor?: string;
	label: string;
};

export function ThemedTextInput({ style, lightColor, darkColor, label, ...rest }: ThemedTextInputProps) {
	const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, "background");
	const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
	const borderColor = useThemeColor({}, "icon");
	const labelColor = useThemeColor({}, "text");

	return (
		<View style={styles.inputContainer}>
			<Text style={[styles.label, { color: labelColor }]}>{label}</Text>
			<TextInput
				style={[styles.input, { backgroundColor, color, borderColor }, style]}
				placeholderTextColor={useThemeColor({}, "icon")}
				{...rest}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	inputContainer: {
		marginBottom: 15,
	},
	label: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 5,
	},
	input: {
		height: 40,
		borderWidth: 1,
		borderRadius: 5,
		paddingHorizontal: 10,
		fontSize: 16,
	},
});
