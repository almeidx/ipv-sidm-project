import Ionicons from "@expo/vector-icons/Ionicons";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import { BasePage } from "../../components/base-page";
import type { GetCurrentUserResult } from "../../lib/api-types";
import { makeApiRequest } from "../../lib/make-api-request";
import "dayjs/locale/pt";
import { toast } from "sonner-native";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { CacheKey } from "../../lib/cache";

dayjs.locale("pt");

export default function Profile() {
	const router = useRouter();
	const [user, setUser] = useState<GetCurrentUserResult | null>(null);
	const [name, setName] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const [hasChanges, setHasChanges] = useState(false);

	useEffect(() => {
		async function fetchUser() {
			try {
				const { data } = await makeApiRequest<GetCurrentUserResult>(
					"/users/@me",
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
						failMessage: "Falha ao buscar dados do utilizador",
					},
				);

				if (data) {
					const formattedUser = {
						...data,
						createdAt: dayjs(data.createdAt).format("D [de] MMMM [de] YYYY"),
					};

					setUser(formattedUser);
					setName(formattedUser.name);
					setEmail(formattedUser.email);
				}
			} catch (error) {
				console.error("Erro ao buscar dados do utilizador:", error);
			}
		}

		fetchUser();
	}, []);

	async function handleLogout() {
		Alert.alert("", "Tem a certeza que deseja terminar a sessão?", [
			{
				text: "Não",
				style: "cancel",
			},
			{
				text: "Sim",
				style: "destructive",
				onPress: async () => {
					await SecureStore.deleteItemAsync(CacheKey.AuthToken);
					toast.success("Sessão encerrada com sucesso");
					router.push("/login");
				},
			},
		]);
	}

	async function handleDeleteAccount() {
		Alert.alert(
			"Confirmar Apagar Conta",
			"Tem a certeza que deseja apagar a sua conta? Esta ação é irreversível.",
			[
				{
					text: "Cancelar",
					style: "cancel",
				},
				{
					text: "Apagar",
					style: "destructive",
					onPress: async () => {
						try {
							await makeApiRequest("/users/@me", {
								method: "DELETE",
								failMessage: "Falha ao apagar conta",
							});

							toast.success("Conta apagada com sucesso");
							await SecureStore.deleteItemAsync(CacheKey.AuthToken);
							router.push("/login");
						} catch (error) {
							console.error("Erro ao apagar conta:", error);
							toast.error("Erro ao apagar conta. Por favor, tente novamente.");
						}
					},
				},
			],
		);
	}

	async function handleSaveChanges() {
		try {
			await makeApiRequest("/users/@me", {
				method: "PATCH",
				body: JSON.stringify({
					name,
					email,
				}),
				headers: {
					"Content-Type": "application/json",
				},
				failMessage: "Falha ao guardadas alterações",
			});

			setUser((prevUser) => {
				if (prevUser) {
					return { ...prevUser, name, email };
				}
				return prevUser;
			});

			setHasChanges(false);

			toast.success("Alterações guardadas com sucesso");
		} catch (error) {
			console.error("Erro ao guardadas alterações:", error);
			toast.error("Erro ao guardadas alterações");
		}
	}

	function handleNameChange(value: string) {
		setName(value);
		setHasChanges(true);
	}

	function handleEmailChange(value: string) {
		setEmail(value);
		setHasChanges(true);
	}

	if (!user) {
		return (
			<BasePage>
				<ActivityIndicator size="large" color="blue" />
			</BasePage>
		);
	}

	return (
		<BasePage>
			<View className="flex gap-12 p-4">
				<View className="flex-1 justify-center items-center pr-4">
					<Ionicons name="person-circle" size={100} color="gray" />
					<Text className="text-gray-500 mt-2">Conta criada a:</Text>
					<Text className="text-gray-700 font-semibold">{user.createdAt}</Text>
				</View>

				<View className="flex-1 justify-evenly">
					<View className="mb-4">
						<Text className="font-bold text-lg">Nome</Text>
						<Input
							value={name}
							onChangeText={handleNameChange}
							placeholder="Nome"
						/>
					</View>

					<View>
						<Text className="font-bold text-lg">Email</Text>
						<Input
							value={email}
							onChangeText={handleEmailChange}
							placeholder="Email"
						/>
					</View>
				</View>

				<View className="gap-5">
					{hasChanges && (
						<Button
							title="Salvar alterações"
							variant="outline"
							onPress={handleSaveChanges}
						/>
					)}

					<Button title="Logout" onPress={handleLogout} />

					<Button
						title="Apagar conta"
						variant="danger"
						onPress={handleDeleteAccount}
					/>
				</View>
			</View>
		</BasePage>
	);
}
