import { Link, useRouter } from "expo-router";
import { Image, View, Text, TextInput, TouchableOpacity } from "react-native";
import { API_URL } from "../../utils/constants"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from "react";
import { toast } from "sonner-native";
import { LinearGradient } from "expo-linear-gradient";

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
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					name,
					email,
					password
				})
			});

			switch (response.status) {
				case 201: {
					const { token } = await response.json() as { token: string };

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
		<View className="flex-1 items-center pt-9 flex flex-col gap-20 h-full">
			<View className="flex flex-col size-full items-center justify-between">
				<Image
					source={require("../../assets/images/logo-white.png")}
					className="size-40"
				/>

				<View className="flex flex-col gap-4 items-center w-full bg-gradient-to-b from-blue-900 to-sky-700">
					<TextInput
						className="w-11/12 px-4 h-14 border-2 border-gray-300 rounded-lg bg-white/10 placeholder:text-white"
						placeholder="Nome"
						secureTextEntry={true}
						textContentType="name"
						value={name}
						onChangeText={(text) => setName(text)}
					/>

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
						textContentType="newPassword"
						value={password}
						onChangeText={(text) => setPassword(text)}
					/>

					<TextInput
						className="w-11/12 px-4 h-14 border-2 border-gray-300 rounded-lg bg-white/10 placeholder:text-white"
						placeholder="Confirm Password"
						secureTextEntry={true}
						textContentType="newPassword"
						value={confirmPassword}
						onChangeText={(text) => setConfirmPassword(text)}
					/>

					<TouchableOpacity className="flex items-center justify-center bg-zinc-300 rounded-3xl w-11/12 h-14" onPress={handleRegister}>
						<Text className="text-black text-xl font-bold">Create</Text>
					</TouchableOpacity>
				</View>

				<Link href="/login" className="text-white text-center leading-[3.5rem] text-xl font-bold rounded-3xl w-11/12 h-14 mb-6 border border-white">
					Login
				</Link>
			</View>

			<LinearGradient
				colors={['#1E3A8A', '#0369A1']}
				className="absolute -z-10 h-screen-safe w-full"
			/>
		</View>
	);
}
