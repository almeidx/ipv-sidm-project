import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
	const colorScheme = useColorScheme();

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
				headerShown: false,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? "home" : "home-outline"} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="explore"
				options={{
					title: "Explore",
					tabBarIcon: ({ color, focused }) => (
						<TabBarIcon name={focused ? "code-slash" : "code-slash-outline"} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="sign-up"
				options={{
					title: "Sign Up",
					tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? "log-in" : "log-in-outline"} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="login"
				options={{
					title: "Login",
					tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? "log-in" : "log-in-outline"} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="sensors"
				options={{
					title: "Sensors",
					tabBarIcon: ({ color, focused }) => (
						<TabBarIcon name={focused ? "settings" : "settings-outline"} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
