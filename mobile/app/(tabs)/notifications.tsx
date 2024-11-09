import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { BasePage } from "../../components/base-page";
import { API_URL } from "../../utils/constants";
import type { GetNotificationsResult } from "../../utils/api-types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/pt";
import { getSensorIcon } from "../../utils/get-sensor-icon";

dayjs.locale("pt");
dayjs.extend(relativeTime);

export default function Notifications() {
	const [notifications, setNotifications] = useState<
		(GetNotificationsResult["notifications"][number] & { message: string; formattedDate: string })[]
	>([]);

	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		async function getNotifications() {
			try {
				const response = await fetch(`${API_URL}/notifications`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				});

				if (!response.ok) {
					throw new Error(`Failed to fetch notifications: ${response.status}`);
				}

				const data: GetNotificationsResult = await response.json();

				const formattedNotifications = data.notifications.map((notification) => {
					let message = "";

					// Formatação da mensagem de notificação com base no threshold
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
				});

				setNotifications(formattedNotifications);
			} catch (error) {
				console.error("Error fetching notifications:", error);
			} finally {
				setIsLoading(false);
			}
		}

		getNotifications();
	}, []);

	return (
		<BasePage title="Notifications">
			<View className="flex flex-col w-full">
				{isLoading ? (
					<ActivityIndicator size="large" color="blue" />
				) : (
					notifications.map((notification) => (
						<View
							key={notification.id}
							className="flex flex-row justify-between items-center pr-4 py-4 border-b border-gray-300"
						>
							<View className="flex flex-row items-center w-full">
								<View style={{ width: 40, height: 40, justifyContent: "center", alignItems: "center" }}>
									<FontAwesome name={getSensorIcon(notification.sensor.sensorTypeId)} size={24} color="grey" />
								</View>
								<View className="ml-3">
									<Text className="font-semibold">{notification.message}</Text>
									<Text className="text-gray-600">Valor: {notification.value}</Text>
									<Text className="text-gray-500">{notification.formattedDate}</Text>
								</View>
							</View>

							<TouchableOpacity>
								<FontAwesome name="times" size={18} color="grey" />
							</TouchableOpacity>
						</View>
					))
				)}
			</View>
		</BasePage>
	);
}
