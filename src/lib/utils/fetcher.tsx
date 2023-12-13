import { createCacheKey } from "../cache";
import { config } from "../config";
import { AIRSTACK_ENDPOINT } from "../constants";
import { VariablesType } from "../types";

export async function _fetch<ResponseType = any>(
  query: string,
  variables: VariablesType,
  abortController?: AbortController
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
      signal: abortController ? abortController?.signal : null,
      body: JSON.stringify({
        query,
        variables,
      }),
    });
    const json = await res.json();
    const data = json?.data;
    let error = null;
    if (json?.errors) {
      error = json?.errors;
    }
    return [data, error];
  } catch (error) {
    return [
      null,
      (error as { message: string })?.message || "Unable to fetch data",
    ];
  }
}
const promiseCache: {
  [key: string]: {
    promise: Promise<[any, any]>;
    abortController?: AbortController;
  };
} = {};

export async function fetchGql<ResponseType = any>(
  query: string,
  variables: VariablesType,
  abortController?: AbortController
): Promise<[ResponseType | null, any]> {
  const key = createCacheKey(query, variables);
  const cached = promiseCache[key];
  // if no cache promise or if the abort controller is different, create a new promise
  if (!cached || cached?.abortController?.signal.aborted) {
    const promise = _fetch<ResponseType>(
      query,
      variables,
      abortController
    ).finally(() => {
      delete promiseCache[key];
    });

    promiseCache[key] = { promise, abortController };
  }
  return promiseCache[key].promise;
}
