import { Link, useRouter } from "expo-router";
import { Image, View, Text, TouchableOpacity } from "react-native";
import { API_URL } from "../../lib/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { toast } from "sonner-native";
import { LinearGradient } from "expo-linear-gradient";
import { Input } from "../../components/input";
import { BasePage } from "../../components/base-page";
import { Button } from "../../components/button";


export default function SignUp() {
	const router = useRouter();

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	async function handleRegister() {
		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		try {
			const response = await fetch(`${API_URL}/auth/register`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name,
					email,
					password,
				}),
			});

			switch (response.status) {
				case 201: {
					const { token } = (await response.json()) as { token: string };

					await AsyncStorage.setItem("token", token);

					toast.success("Account created successfully");
					router.push("/");

					break;
				}

				case 400: {
					toast.error("Your name, email, or password is invalid");
					break;
				}

				case 409: {
					toast.error("User with that email already exists");
					break;
				}

				default: {
					console.error("Unknown error occurred", response.status, await response.text());
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


			<View className="flex flex-col gap-4 items-center w-full px-5">
				<Input
					placeholder="Nome"
					textContentType="name"
					value={name}
					onChangeText={(text) => setName(text)}
				/>

				<Input
					placeholder="Email"
					textContentType="emailAddress"
					value={email}
					onChangeText={(text) => setEmail(text)}
				/>

				<Input
					placeholder="Password"
					secureTextEntry={true}
					textContentType="newPassword"
					value={password}
					onChangeText={(text) => setPassword(text)}
				/>

				<Input
					placeholder="Confirm Password"
					secureTextEntry={true}
					textContentType="newPassword"
					value={confirmPassword}
					onChangeText={(text) => setConfirmPassword(text)}
				/>

				<Button
					title="Create"
					onPress={handleRegister}
				/>


			</View>

			<View className="flex-col gap-9 items-center w-full px-5" >
				<Button
					title="Login"
					variant="outline"
					onPress={() => router.push("/login")}
				/>
			</View>
		</BasePage>
	);
}
