import { Image, Platform, StyleSheet, TextInput } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedButton } from "@/components/ui/ThemedButton";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedTextInput } from "@/components/ui/ThemedTextInput";
import { ThemedView } from "@/components/ui/ThemedView";
import { Link } from "expo-router";
import { useState } from "react";
import { API_URL } from "@/utils/constants";
import { z } from "zod";
import { toast } from "sonner-native";

const schema = z
	.object({
		name: z
			.string()
			.min(3, { message: "Name must be at least 3 characters long" })
			.max(32, { message: "Name must be at most 32 characters long" }),
		email: z.string().email({ message: "Enter a valid email address" }),
		password: z
			.string()
			.min(12, { message: "Password must be at least 12 characters long" })
			.max(128, { message: "Password must be at most 128 characters long" })
			.regex(/[a-z]/, {
				message: "Password must contain at least one lowercase letter",
			})
			.regex(/[A-Z]/, {
				message: "Password must contain at least one uppercase letter",
			})
			.regex(/[0-9]/, {
				message: "Password must contain at least one number",
			})
			.regex(/[^a-zA-Z0-9]/, {
				message: "Password must contain at least one special character",
			}),
		confirmPassword: z
			.string()
			.min(12, {
				message: "Confirm password must be at least 12 characters long",
			})
			.max(128, {
				message: "Confirm password must be at most 128 characters long",
			}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export default function SignUpScreen() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	async function handleCreateAccount() {
		const result = schema.safeParse({ name, email, password, confirmPassword });
		if (!result.success) {
			toast.error(result.error.errors[0].message);
			return;
		}

		console.log(result.data);

		const { confirmPassword: _, ...data } = result.data;

		const response = await fetch(`${API_URL}/auth/register`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});

		console.log("Response:", response);

		if (!response.ok) {
			toast.error("Failed to create account");
			return;
		}

		console.log("Account created successfully");

		toast.success("Account created successfully");
	}

	return (
		<ParallaxScrollView
			headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
			headerImage={
				<Image
					source={require("~/assets/images/partial-react-logo.png")}
					style={styles.reactLogo}
				/>
			}
		>
			<ThemedView style={styles.titleContainer}>
				<ThemedText type="title">Create Account</ThemedText>
			</ThemedView>

			<ThemedView style={styles.inputContainer}>
				<ThemedTextInput
					label="Name"
					placeholder="Enter your name"
					value={name}
					onChangeText={setName}
					textContentType="name"
				/>
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
				<ThemedTextInput
					label="Confirm password"
					placeholder="Enter your password again"
					secureTextEntry
					value={confirmPassword}
					onChangeText={setConfirmPassword}
					textContentType="newPassword"
				/>
			</ThemedView>

			<ThemedButton title="Create account" onPress={handleCreateAccount} />

			<Link href="/login" style={styles.link}>
				<ThemedText type="link">Already have an account? Login</ThemedText>
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
