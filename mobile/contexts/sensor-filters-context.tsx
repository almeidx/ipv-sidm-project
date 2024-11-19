import { type Dispatch, type PropsWithChildren, type SetStateAction, createContext, useContext, useState } from "react";

const SensorFiltersContext = createContext<SensorFiltersData>(null as unknown as SensorFiltersData);

export function useSensorFilters() {
	const value = useContext(SensorFiltersContext);
	if (!value) {
		throw new Error("useSensorFilters must be wrapped in a <SensorFiltersProvider />");
	}

	return value;
}

export function SensorFiltersProvider({ children }: PropsWithChildren) {
	const [sensorTypes, setSensorTypes] = useState<number[]>([]);
	const [order, setOrder] = useState<string>("created-at");
	const [favourites, setFavorites] = useState<boolean | null>(null);
	const [threshold, setThreshold] = useState<"above" | "below" | null>(null);

	return (
		<SensorFiltersContext.Provider
			value={{
				sensorTypes,
				order,
				favourites,
				threshold,
				setSensorTypes,
				setOrder,
				setFavorites,
				setThreshold,
			}}
		>
			{children}
		</SensorFiltersContext.Provider>
	);
}

export interface SensorFiltersData {
	sensorTypes: number[];
	order: string;
	favourites: boolean | null;
	threshold: "above" | "below" | null;

	setSensorTypes: Dispatch<SetStateAction<number[]>>;
	setOrder: Dispatch<SetStateAction<string>>;
	setFavorites: Dispatch<SetStateAction<boolean | null>>;
	setThreshold: Dispatch<SetStateAction<"above" | "below" | null>>;
}
