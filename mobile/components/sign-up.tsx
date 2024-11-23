import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { View } from "react-native";
import { toast } from "sonner-native";
import { useSession } from "../contexts/session-context";
import { API_URL } from "../lib/constants";
import { BasePage } from "./base-page";
import { Button } from "./button";
import { Input } from "./input";

export default function SignUp({ goToLogin }: { goToLogin: () => void }) {
	const { signUp } = useSession();

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	async function handleRegister() {
		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		await signUp(name, email, password);
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

				<Button title="Create" onPress={handleRegister} />
			</View>

			<View className="flex-col gap-9 items-center w-full px-5">
				<Button title="Login" variant="outline" onPress={goToLogin} />
			</View>
		</BasePage>
	);
}
