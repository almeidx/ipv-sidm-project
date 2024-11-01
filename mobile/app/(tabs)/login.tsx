import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Image, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { API_URL } from "../../utils/constants"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toast } from "sonner-native";
import { LinearGradient } from 'expo-linear-gradient';

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
					const { token } = await response.json() as { token: string };

					await AsyncStorage.setItem("token", token);

					toast.success("Logged in successfully");
					router.push("/");

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
		<View className="flex-1 items-center pt-9 flex flex-col gap-20 h-full">
			<View className="flex flex-col size-full items-center justify-between">
				<Image
					source={require("../../assets/images/logo-white.png")}
					className="size-40"
				/>

				<View className="flex flex-col gap-4 items-center w-full bg-gradient-to-b from-blue-900 to-sky-700">
					<TextInput
						className="w-11/12 px-4 h-14 border-2 border-gray-300 rounded-lg bg-white/10 placeholder:text-white"
						placeholder="Email"
						textContentType="emailAddress"
						value={email}
						onChangeText={(text) => setEmail(text)}
					/>

					<TextInput
						className="w-11/12 px-4 h-14 border-2 border-gray-300 rounded-lg bg-white/10 placeholder:text-white"
						placeholder="Password"
						secureTextEntry={true}
						textContentType="password"
						value={password}
						onChangeText={(text) => setPassword(text)}
					/>

					<TouchableOpacity className="flex items-center justify-center bg-zinc-300 rounded-3xl w-11/12 h-14" onPress={handleLogin}>
						<Text className="text-black text-xl font-bold">Login</Text>
					</TouchableOpacity>
				</View>

				<Link href="/sign-up" className="text-white text-center leading-[3.5rem] text-xl font-bold rounded-3xl w-11/12 h-14 mb-6 border border-white">
					Create new account
				</Link>
			</View>

			<LinearGradient
				colors={['#1E3A8A', '#0369A1']}
				className="absolute -z-10 h-screen-safe w-full"
			/>
		</View>
	);
}
