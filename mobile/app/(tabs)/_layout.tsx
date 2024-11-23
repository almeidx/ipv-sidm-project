import Ionicons from "@expo/vector-icons/Ionicons";
import { Redirect, Tabs } from "expo-router";
import type React from "react";
import { useSession } from "../../contexts/session-context";

function TabBarIcon(props: {
	name: React.ComponentProps<typeof Ionicons>["name"];
	color: string;
}) {
	return <Ionicons size={36} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
	const { token } = useSession();

	if (!token) {
		return <Redirect href="/sign-in" />;
	}

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: "#000",
				headerShown: false,
				tabBarShowLabel: false,
				tabBarStyle: {
					backgroundColor: "#f2f2f2",
					borderTopWidth: 0.5,
					borderTopColor: "rgba(0, 0, 0, 0.2)",
					shadowOpacity: 0,
					elevation: 0,
					height: 60,
					paddingBottom: 10,
				},
				tabBarHideOnKeyboard: true,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
				}}
			/>
			<Tabs.Screen
				name="notifications"
				options={{
					tabBarIcon: ({ color }) => (
						<TabBarIcon name="notifications" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />,
				}}
			/>
			<Tabs.Screen name="create-sensor" options={{ href: null }} />
			<Tabs.Screen name="sensor-details/[sensorId]" options={{ href: null }} />
		</Tabs>
	);
}
