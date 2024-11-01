import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import type React from "react";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
	name: React.ComponentProps<typeof FontAwesome>["name"];
	color: string;
}) {
	return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: "#000",
				headerShown: true,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					headerShown: false,
					tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
				}}
			/>
			<Tabs.Screen
				name="login"
				options={{
					headerShown: false,
					tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
				}}
			/>
			<Tabs.Screen
				name="sign-up"
				options={{
					headerShown: false,
					tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
				}}
			/>
			<Tabs.Screen
				name="create-sensor"
				options={{
					headerShown: false,
					tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
				}}
			/>
		</Tabs>
	);
}
