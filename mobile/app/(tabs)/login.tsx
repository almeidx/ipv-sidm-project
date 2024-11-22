import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import { View } from "react-native";
import { toast } from "sonner-native";
import { BasePage } from "../../components/base-page";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { API_URL } from "../../lib/constants";
import { CacheKey } from "../../lib/cache";

export default function Login() {
	const router = useRouter();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	async function handleLogin() {
		try {
			const response = await fetch(`${API_URL}/auth/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email,
					password,
				}),
			});

			switch (response.status) {
				case 200: {
					const { token } = (await response.json()) as { token: string };

					await SecureStore.setItemAsync(CacheKey.AuthToken, token);

					toast.success("Logged in successfully");
					router.push("/profile");

					break;
				}

				case 400: {
					toast.error("Your email or password is invalid");
					break;
				}

				case 401: {
					toast.error("Invalid email or password");
					break;
				}

				case 404: {
					toast.error("User with that email was not found");
					break;
				}

				default: {
					console.error(
						"Unknown error occurred",
						response.status,
						await response.text(),
					);
					toast.error("Unknown error occurred");
					break;
				}
			}
		} catch (error) {
			console.error(error);
			toast.error("An error occurred. Please try again later");
		}
	}

	return (
		<BasePage centerContent>
			<View className="flex-1 justify-center items-center w-full gap-6 px-5 min-h-96">
				<Input
					placeholder="Email"
					textContentType="emailAddress"
					value={email}
					onChangeText={setEmail}
				/>

				<Input
					placeholder="Password"
					secureTextEntry
					textContentType="password"
					value={password}
					onChangeText={setPassword}
				/>

				<Button title="Login" onPress={handleLogin} />
			</View>

			<View className="justify-center items-center w-full gap-6 px-5">
				<Button
					title="Create new account"
					onPress={() => router.push("/sign-up")}
				/>
			</View>
		</BasePage>
	);
}
