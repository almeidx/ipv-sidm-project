import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { toast } from "sonner-native";
import { CacheKey } from "./cache";
import { API_URL } from "./constants";

export async function makeApiRequest(endpoint: string, init?: MakeApiRequestOptions): Promise<null>;
export async function makeApiRequest<Result>(
	endpoint: string,
	init?: MakeApiRequestOptions,
): Promise<MakeApiRequestResult<Result>>;
export async function makeApiRequest<Result>(
	endpoint: string,
	{ query, failMessage = "Unknown error when getting data", ...init }: MakeApiRequestOptions = {},
): Promise<MakeApiRequestResult<Result> | null> {
	try {
		const queryString = query
			? new URLSearchParams(Object.fromEntries(Object.entries(query).filter(([, value]) => value))).toString()
			: "";

		const authToken = await SecureStore.getItemAsync(CacheKey.AuthToken);
		if (authToken) {
			init.headers ??= {};
			(init.headers as { Authorization: string }).Authorization = `Bearer ${authToken}`;
		}

		const response = await fetch(`${API_URL}${endpoint}${query ? `?${queryString}` : ""}`, init);

		const isJsonResponse = response.headers.get("content-type")?.includes("application/json");

		if (!response.ok) {
			if (response.status === 401 && isJsonResponse) {
				const data = await response.json();
				if (data.message === "Authorization token expired" || data.message === "Unauthorized") {
					toast.error("Sessão expirada, por favor faça login novamente");
					await SecureStore.deleteItemAsync(CacheKey.AuthToken);
					router.push("/sign-in");
					return null;
				}

				console.error(`Failed to fetch ${endpoint} (code: ${response.status}):`, data.message);
				toast.error(data.message);
				return { data: null, response };
			}

			console.error(`Failed to fetch ${endpoint} (code: ${response.status}):`, await response.text());
			toast.error(failMessage);
			return { data: null, response };
		}

		if (!isJsonResponse) {
			return { data: null, response };
		}

		const data = (await response.json()) as Result;
		return { data, response };
	} catch (error) {
		console.error(`Network error when fetching ${endpoint}:`, error);
		toast.error(failMessage);
		return null;
	}
}

interface MakeApiRequestOptions extends RequestInit {
	query?: Record<string, string>;
	failMessage?: string;
}

interface MakeApiRequestResult<Data> {
	data: Data | null;
	response: Response;
}
