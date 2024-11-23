import dayjs from "dayjs";
import "dayjs/locale/pt";
import Ionicons from "@expo/vector-icons/Ionicons";
import relativeTime from "dayjs/plugin/relativeTime";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { toast } from "sonner-native";
import { BasePage } from "../../components/base-page";
import type { GetNotificationsResult } from "../../lib/api-types";
import { API_URL } from "../../lib/constants";
import { getSensorIcon } from "../../lib/get-sensor-icon";
import { makeApiRequest } from "../../lib/make-api-request";

dayjs.locale("pt");
dayjs.extend(relativeTime);

export default function Notifications() {
	const [notifications, setNotifications] = useState<
		(GetNotificationsResult["notifications"][number] & {
			message: string;
			formattedDate: string;
		})[]
	>([]);

	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		async function getNotifications() {
			try {
				const { data } = await makeApiRequest<GetNotificationsResult>(
					"/notifications",
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
						failMessage: "Failed to fetch notifications",
					},
				);

				if (data) {
					const formattedNotifications = data.notifications.map(
						(notification) => {
							let message = "";

							switch (notification.thresholdSurpassed) {
								case 0:
									message = `${notification.sensor.name} voltou ao normal.`;
									break;
								case 1:
									message = `${notification.sensor.name} passou o threshold de baixo.`;
									break;
								case 2:
									message = `${notification.sensor.name} passou o threshold de cima.`;
									break;
								default:
									message = "Status desconhecido";
							}

							const formattedDate = dayjs(notification.createdAt).fromNow();

							return {
								...notification,
								message,
								formattedDate,
							};
						},
					);

					setNotifications(formattedNotifications);
				}
			} catch (error) {
				console.error("Error fetching notifications:", error);
			} finally {
				setIsLoading(false);
			}
		}

		getNotifications();
	}, []);

	async function markAsRead(id: number) {
		try {
			const result = await makeApiRequest(`/notifications/${id}/mark-as-read`, {
				method: "POST",
				failMessage: "Falha ao marcar a notificação como lida",
			});

			setNotifications((prevNotifications) =>
				prevNotifications.filter((notification) => notification.id !== id),
			);
			toast.info("Notificação marcada como lida");
		} catch (error) {
			console.error("Erro ao marcar notificação como lida:", error);
		}
	}

	async function clearAllNotifications() {
		try {
			const response = await makeApiRequest("/notifications/clear", {
				method: "POST",
				failMessage: "Falha ao limpar notificações",
			});

			if (response) {
				setNotifications([]);
				toast.info("Todas as notificações foram removidas!");
			}
		} catch (error) {
			console.error("Erro ao limpar notificações:", error);
			Alert.alert("Erro", "Falha ao limpar notificações.");
		}
	}

	function confirmClearNotifications() {
		Alert.alert(
			"Confirmar",
			"Tem a certeza de que deseja remover todas as notificações?",
			[
				{
					text: "Cancelar",
					style: "cancel",
				},
				{
					text: "Remover",
					style: "destructive",
					onPress: clearAllNotifications,
				},
			],
		);
	}

	if (!notifications.length) {
		return (
			<BasePage title="Notificações">
				<View
					style={{
						height: 500,
						flex: 1,
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<View className="flex flex-col items-center">
						<Ionicons name="notifications-off" size={40} color="gray" />
						<Text className="text-gray-500 mt-4">Sem notificações</Text>
					</View>
				</View>
			</BasePage>
		);
	}

	return (
		<BasePage
			title="Notificações"
			rightSide={
				<TouchableOpacity onPress={confirmClearNotifications}>
					<Ionicons size={32} name="checkmark-done-outline" />
				</TouchableOpacity>
			}
		>
			<View className="flex flex-col w-full">
				{isLoading ? (
					<ActivityIndicator size="large" color="blue" />
				) : (
					notifications.map(
						({
							id,
							sensor,
							message,
							value,
							formattedDate,
							thresholdSurpassed,
						}) => (
							<View
								key={id}
								className="flex flex-row justify-between items-center pr-4 py-4 border-b border-gray-300"
							>
								<View className="flex flex-row items-center w-full">
									<View className="size-10 flex justify-center items-center">
										<Ionicons
											name={getSensorIcon(sensor.sensorType.id)}
											size={24}
											color="grey"
										/>
									</View>

									<View className="ml-3">
										<Text className="font-semibold">{message}</Text>

										<View className="flex flex-row gap-1 items-center">
											<Text className="text-gray-600">
												Valor {value} {sensor.sensorType.unit}
											</Text>
											{thresholdSurpassed === 1 && (
												<Ionicons name="arrow-down" size={15} color="red" />
											)}
											{thresholdSurpassed === 2 && (
												<Ionicons name="arrow-up" size={18} color="red" />
											)}
										</View>

										<Text className="text-gray-500">{formattedDate}</Text>
									</View>
								</View>

								<TouchableOpacity onPress={() => markAsRead(id)}>
									<Ionicons name="checkmark" size={22} color="grey" />
								</TouchableOpacity>
							</View>
						),
					)
				)}
			</View>
		</BasePage>
	);
}
