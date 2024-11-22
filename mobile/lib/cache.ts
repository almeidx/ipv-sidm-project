import AsyncStorage from "@react-native-async-storage/async-storage";

export enum CacheKey {
	SensorTypes = "sensorTypes",
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
		if (cachedValue) {
			const { value, expirationTime } = JSON.parse(cachedValue);

			if (expirationTime > Date.now()) {
				return value;
			}

			await AsyncStorage.removeItem(key);
		}

		const newValue = await fn();

		const expirationTime = Date.now() + ttlSeconds * 1_000;
		await AsyncStorage.setItem(
			key,
			JSON.stringify({ value: newValue, expirationTime }),
		);

		return newValue;
	} catch (error) {
		console.error("Error in findOrCreate:", error);
		throw error;
	}
}
