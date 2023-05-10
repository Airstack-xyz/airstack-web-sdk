import { config } from "../config";
import { AIRSTACK_ENDPOINT } from "../constants";

export async function fetchGql<ResponseType = any>(
  query,
  variables
): Promise<[ResponseType | null, any]> {
  if (!config.authKey) {
    throw new Error("No API key provided");
  }
  try {
    const res = await fetch(AIRSTACK_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: config.authKey,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });
    const json = await res.json();
    const data = json?.data;
    let error = null;
    if (json.errors) {
      error = json.errors;
    }
    return [data, error];
  } catch (error) {
    return [null, error];
  }
}
