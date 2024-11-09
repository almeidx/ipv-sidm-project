import { toast } from "sonner-native";
import { API_URL } from "./constants";

export async function makeApiRequest(endpoint: string, init?: MakeApiRequestOptions): Promise<null>;
export async function makeApiRequest<Result>(endpoint: string, init?: MakeApiRequestOptions): Promise<Result>;
export async function makeApiRequest<Result>(endpoint: string, {query, ...init}: MakeApiRequestOptions = {}): Promise<Result | null> {
  try {
		const queryString = query ? new URLSearchParams(query).toString() : "";

    const response = await fetch(`${API_URL}${endpoint}${query ? `?${queryString}` : ""}`, init);

    if (!response.ok) {
      console.error(`Failed to fetch ${endpoint} (code: ${response.status}):`, await response.text());
			toast.error('Unknown error when getting data');
			return null;
		}

		const isJsonResponse = response.headers.get("content-type")?.includes("application/json");
		if (!isJsonResponse) {
			return null;
		}

		const data = (await response.json()) as Result;
		return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
		toast.error('Network failure when getting data');
		return null
  }
}

interface MakeApiRequestOptions extends RequestInit {
	query?: Record<string, string>;
}
