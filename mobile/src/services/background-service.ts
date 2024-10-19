import { BackgroundFetchResult, registerTaskAsync } from 'expo-background-fetch';
import { defineTask } from 'expo-task-manager';
import { getCurrentPositionAsync, requestForegroundPermissionsAsync } from 'expo-location';
import { Accelerometer, type AccelerometerMeasurement } from 'expo-sensors';
import { WS_SERVER_URL } from "@/utils/constants";

const BACKGROUND_FETCH_TASK = 'background-fetch';

let ws: WebSocket | undefined;

defineTask(BACKGROUND_FETCH_TASK, async () => {
  console.log('Background fetch task started');

  try {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      ws = new WebSocket(WS_SERVER_URL);
    }

    const { status } = await requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }

    const location = await getCurrentPositionAsync();

    const { x, y, z } = await new Promise<AccelerometerMeasurement>((resolve) => {
      Accelerometer.addListener(resolve);
    });

    const sensorData = {
      timestamp: new Date().toISOString(),
      gps: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
      accelerometer: { x, y, z },
    };

    if (ws.readyState === WebSocket.OPEN) {
      console.log('Sending data:', sensorData);
      ws.send(JSON.stringify(sensorData));
    }

    console.log('Data sent:', sensorData);

    return BackgroundFetchResult.NewData;
  } catch (error) {
    console.log('Error in background fetch:', error);
    return BackgroundFetchResult.Failed;
  }
});

async function registerBackgroundFetchAsync() {
  try {
    await registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 60, // 1 minute
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('Background fetch task registered');
  } catch (err) {
    console.log('Background fetch task registration failed:', err);
  }
}

registerBackgroundFetchAsync();
