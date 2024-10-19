import { useThemeColor } from "@/hooks/useThemeColor";
import { StyleSheet, Text, TouchableOpacity, type TouchableOpacityProps } from "react-native";

export type ThemedButtonProps = TouchableOpacityProps & {
	title: string;
	lightColor?: string;
	darkColor?: string;
};

export function ThemedButton({ style, lightColor, darkColor, title, ...rest }: ThemedButtonProps) {
	const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, "tint");
	const color = useThemeColor({}, "background");

	return (
		<TouchableOpacity style={[styles.button, { backgroundColor }, style]} {...rest}>
			<Text style={[styles.buttonText, { color }]}>{title}</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	button: {
		height: 40,
		borderRadius: 5,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 15,
	},
	buttonText: {
		fontSize: 16,
		fontWeight: "600",
	},
});
