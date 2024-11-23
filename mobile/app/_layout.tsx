import Ionicons from "@expo/vector-icons/Ionicons";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster } from "sonner-native";
import "../global.css";
import { SensorFiltersProvider } from "../contexts/sensor-filters-context";
import { SessionProvider } from "../contexts/session-context";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
	initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [loaded, error] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
		...Ionicons.font,
	});

	useEffect(() => {
		if (error) throw error;
	}, [error]);

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return <RootLayoutNav />;
}

function RootLayoutNav() {
	return (
		<SafeAreaProvider>
			<GestureHandlerRootView>
				<SensorFiltersProvider>
					<SessionProvider>
						<Stack>
							<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
							<Stack.Screen name="sign-in" options={{ headerShown: false }} />
						</Stack>

						<Toaster position="bottom-center" />
					</SessionProvider>
				</SensorFiltersProvider>
			</GestureHandlerRootView>
		</SafeAreaProvider>
	);
}
