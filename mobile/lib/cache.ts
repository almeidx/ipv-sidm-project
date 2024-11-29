import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

export enum CacheKey {
	SensorTypes = "sensorTypes",
	SensorsData = "sensorsData",
	SensorData = "sensorData",
	FavouriteSensors = "favourites",
	AuthToken = "authToken",
}

export async function findOrCreate<Data>(
	key: string,
	fn: () => Promise<Data> | Data,
	ttlSeconds: number,
): Promise<Data> {
	try {
		const cachedValue = await AsyncStorage.getItem(key);

		const netState = await NetInfo.fetch();
		const isOffline = !netState.isConnected;

		if (cachedValue) {
			const { value, expirationTime } = JSON.parse(cachedValue);

			if (isOffline || expirationTime > Date.now()) {
				return value;
			}

			await AsyncStorage.removeItem(key);
		}

		if (isOffline) {
			throw new Error("No network connection and no valid cached data");
		}

		const newValue = await fn();

		const expirationTime = Date.now() + ttlSeconds * 1_000;
		await AsyncStorage.setItem(key, JSON.stringify({ value: newValue, expirationTime }));

		return newValue;
	} catch (error) {
		console.error("Error in findOrCreate:", error);
		throw error;
	}
}
