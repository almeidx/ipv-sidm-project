import { toast } from "sonner-native";
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

		const response = await fetch(`${API_URL}${endpoint}${query ? `?${queryString}` : ""}`, init);

		if (!response.ok) {
			console.error(`Failed to fetch ${endpoint} (code: ${response.status}):`, await response.text());
			toast.error(failMessage);
			return { data: null, response };
		}

		const isJsonResponse = response.headers.get("content-type")?.includes("application/json");
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
