import { Image, Platform, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedButton } from "@/components/ui/ThemedButton";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedTextInput } from "@/components/ui/ThemedTextInput";
import { ThemedView } from "@/components/ui/ThemedView";
import { Link } from "expo-router";
import { useState } from "react";
import { toast } from "sonner-native";
import { API_URL } from "@/utils/constants";
import { z } from "zod";

const schema = z.object({
	email: z.string().email({ message: "Enter a valid email address" }),
	password: z
		.string()
		.min(12, { message: "Password must be at least 12 characters long" })
		.max(128, { message: "Password must be at most 128 characters long" }),
})

export default function LoginScreen() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	async function handleLogin() {
		const result = schema.safeParse({ email, password });
		if (!result.success) {
			toast.error(result.error.errors[0].message);
			return;
		}

		console.log(result.data);

		const response = await fetch(`${API_URL}/auth/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(result.data),
		});

		if (!response.ok) {
			console.error("Failed to login", response);
			toast.error("Failed to login");
			return;
		}

		const { token } = (await response.json()) as { token: string };

		console.log("Logged in successfully", token);

		toast.success("Logged in successfully");
	}

	return (
		<ParallaxScrollView
			headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
			headerImage={<Image source={require("~/assets/images/partial-react-logo.png")} style={styles.reactLogo} />}
		>
			<ThemedView style={styles.titleContainer}>
				<ThemedText type="title">Login</ThemedText>
			</ThemedView>

			<ThemedView style={styles.inputContainer}>
				<ThemedTextInput
					label="Email"
					placeholder="Enter your email"
					value={email}
					onChangeText={setEmail}
					textContentType="emailAddress"
				/>
				<ThemedTextInput
					label="Password"
					placeholder="Enter your password"
					secureTextEntry
					value={password}
					onChangeText={setPassword}
					textContentType="newPassword"
				/>
			</ThemedView>

			<ThemedButton title="Login" onPress={handleLogin} />

			<Link href="/sign-up" style={styles.link}>
				<ThemedText type="link">Don't have an account? Create account</ThemedText>
			</Link>
		</ParallaxScrollView>
	);
}

const styles = StyleSheet.create({
	titleContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	inputContainer: {
		flexDirection: "column",
		gap: 8,
	},
	input: {
		flex: 1,
	},
	stepContainer: {
		gap: 8,
		marginBottom: 8,
	},
	reactLogo: {
		height: 178,
		width: 290,
		bottom: 0,
		left: 0,
		position: "absolute",
	},
	link: {
		alignSelf: "center",
		marginTop: 8,
	},
});
