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
	const [categories, setCategories] = useState<string[]>([]);

	return (
		<SensorFiltersContext.Provider
			value={{
				sensorTypes,
				order,
				categories,
				setSensorTypes,
				setOrder,
				setCategories,
			}}
		>
			{children}
		</SensorFiltersContext.Provider>
	);
}

export interface SensorFiltersData {
	sensorTypes: number[];
	order: string;
	categories: string[];

	setSensorTypes: Dispatch<SetStateAction<number[]>>;
	setOrder: Dispatch<SetStateAction<string>>;
	setCategories: Dispatch<SetStateAction<string[]>>;
}
