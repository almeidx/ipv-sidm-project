import { useState } from "react";
import { View } from "react-native";
import { useSession } from "../contexts/session-context";
import { BasePage } from "./base-page";
import { Button } from "./button";
import { Input } from "./input";

export default function Login({ goToSignUp }: { goToSignUp: () => void }) {
	const { signIn } = useSession();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	async function handleLogin() {
		await signIn(email, password);
	}

	return (
		<BasePage centerContent>
			<View className="flex-1 justify-center items-center w-full gap-6 px-5 min-h-96">
				<Input placeholder="Email" textContentType="emailAddress" value={email} onChangeText={setEmail} />

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
				<Button title="Create new account" onPress={goToSignUp} />
			</View>
		</BasePage>
	);
}
