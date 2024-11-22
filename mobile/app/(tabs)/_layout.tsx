import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import * as SecureStorage from "expo-secure-store";
import type React from "react";
import { CacheKey } from "../../lib/cache";

function TabBarIcon(props: {
	name: React.ComponentProps<typeof Ionicons>["name"];
	color: string;
}) {
	return <Ionicons size={36} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
	const isLoggedIn = SecureStorage.getItem(CacheKey.AuthToken);

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: "#000",
				headerShown: false,
				tabBarShowLabel: false,
				tabBarStyle: {
					// backgroundColor: "#f8f8f8",
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
			{isLoggedIn ? (
				<Tabs.Screen
					name="profile"
					options={{
						tabBarIcon: ({ color }) => (
							<TabBarIcon name="person" color={color} />
						),
					}}
				/>
			) : (
				<Tabs.Screen
					name="login"
					options={{
						tabBarIcon: ({ color }) => (
							<TabBarIcon name="person" color={color} />
						),
					}}
				/>
			)}

			{/* These need to be split because we can't use Fragments in the <Tabs> children */}
			{isLoggedIn ? (
				<Tabs.Screen name="login" options={{ href: null }} />
			) : (
				<Tabs.Screen name="profile" options={{ href: null }} />
			)}

			<Tabs.Screen name="create-sensor" options={{ href: null }} />
			<Tabs.Screen name="sign-up" options={{ href: null }} />
			<Tabs.Screen name="sensor-details/[sensorId]" options={{ href: null }} />
		</Tabs>
	);
}
