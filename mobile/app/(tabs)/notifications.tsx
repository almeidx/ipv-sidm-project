import { FontAwesome } from "@expo/vector-icons";
import dayjs from "dayjs";
import "dayjs/locale/pt";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { toast } from "sonner-native";
import { BasePage } from "../../components/base-page";
import type { GetNotificationsResult } from "../../utils/api-types";
import { API_URL } from "../../utils/constants";
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

	async function markAsRead(id: number) {
		try {
			const response = await fetch(`${API_URL}/notifications/${id}/mark-as-read`, {
				method: "POST",
			});

			if (!response.ok) {
				console.log(response);
				throw new Error("Failed to mark notification as read");
			}

			setNotifications((prevNotifications) => prevNotifications.filter((notification) => notification.id !== id)
			);

			toast.info("Notificação marcada como lida");
		} catch (error) {
			console.error("Error marking notification as read:", error);
		}
	}

	return (
		<BasePage title="Notifications">
			<View className="flex flex-col w-full">
				{isLoading ? (
					<ActivityIndicator size="large" color="blue" />
				) : (
					notifications.map(({ id, sensor, message, value, formattedDate, thresholdSurpassed }) => (
						<View
							key={id}
							className="flex flex-row justify-between items-center pr-4 py-4 border-b border-gray-300"
						>
							<View className="flex flex-row items-center w-full">
								<View className="size-10 flex justify-center items-center">
									<FontAwesome name={getSensorIcon(sensor.sensorType.id)} size={24} color="grey" />
								</View>

								<View className="ml-3">
									<Text className="font-semibold">{message}</Text>

									<View className="flex flex-row gap-0 items-center">
										<Text className="text-gray-600">Valor {value} {sensor.sensorType.unit}</Text>
										{thresholdSurpassed === 1 && (
											<FontAwesome name="arrow-down" size={18} color="red" />
										)}
										{thresholdSurpassed === 2 && (
											<FontAwesome name="arrow-up" size={18} color="red" />
										)}
									</View>

									<Text className="text-gray-500">{formattedDate}</Text>
								</View>
							</View>

							<TouchableOpacity onPress={() => markAsRead(id)}>
								<FontAwesome name="times" size={18} color="grey" />
							</TouchableOpacity>
						</View>
					))
				)}
			</View>
		</BasePage>
	);
}
