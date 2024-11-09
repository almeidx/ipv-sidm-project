export interface GetSensorTypesResult {
	sensorTypes: {
		id: number;
		name: string;
		unit: string;
	}[];
}

export interface GetNotificationsResult {
    notifications: {
      id: number;
      createdAt: string;
      sensor: {
        id: number;
        name: string;
        sensorType: {
          id: number;
          unit: string;
        }
      };
      thresholdSurpassed: number;
      value: number;
    }[];
  }

  export interface GetSensorsDataResult {
    sensors: {
      id: number;
      name: string;
      sensorData: {
        value: number;
        label: string;
      }[];
      currentValue: string;
      minValue: number;
      thresholdWarning: "above" | "below" | null;
      sensorTypeId: number;
    }[];
  }
