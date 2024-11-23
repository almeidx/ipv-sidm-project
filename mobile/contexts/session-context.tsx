import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
	type PropsWithChildren,
	createContext,
	useContext,
	useState,
} from "react";
import { toast } from "sonner-native";
import { CacheKey } from "../lib/cache";
import { API_URL } from "../lib/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext<SessionContextData>(
	null as unknown as SessionContextData,
);

export function useSession() {
	const value = useContext(AuthContext);
	if (!value) {
		throw new Error("useSession must be wrapped in a <SessionProvider />");
	}

	return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
	const router = useRouter();
	const [token, setToken] = useState<string | null>(() =>
		SecureStore.getItem(CacheKey.AuthToken),
	);

	async function signIn(email: string, password: string) {
		try {
			const response = await fetch(`${API_URL}/auth/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: email.trim().toLowerCase(),
					password,
				}),
			});

			switch (response.status) {
				case 200: {
					const { token } = (await response.json()) as { token: string };

					await SecureStore.setItemAsync(CacheKey.AuthToken, token);
					setToken(token);

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

	async function signUp(name: string, email: string, password: string) {
		try {
			const response = await fetch(`${API_URL}/auth/register`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: name.trim(),
					email: email.trim().toLowerCase(),
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

	async function signOut() {
		await SecureStore.deleteItemAsync(CacheKey.AuthToken);
		setToken(null);

		router.push("/sign-in");
	}

	return (
		<AuthContext.Provider value={{ signIn, signUp, signOut, token }}>
			{children}
		</AuthContext.Provider>
	);
}

interface SessionContextData {
	signIn(email: string, password: string): Promise<void>;
	signUp(name: string, email: string, password: string): Promise<void>;
	signOut(): Promise<void>;
	token: string | null;
}
