import { fetchGql } from "../utils/fetcher";
import {
  Config,
  FetchQueryReturnType,
  ResponseType,
  Variables,
} from "../types";
import { cacheResponse, getFromCache } from "../cache";
import { stringifyObjectValues } from "../utils/stringifyObjectValues";
import { config as globalConfig } from "../config";
import { cacheImagesFromQuery } from "../utils/cacheImagesFromQuery";

export async function fetchQuery(
  query: string,
  variables?: Variables,
  _config?: Config
): FetchQueryReturnType {
  const _variables: Variables = stringifyObjectValues(variables || {});

  const config = { ...globalConfig, ..._config };

  let data: null | ResponseType = config.cache
    ? getFromCache(query, _variables || {})
    : null;
  let error = null;

  if (!data) {
    const [response, _error] = await fetchGql<any>(query, _variables);
    data = response;
    error = _error;
    if (config.cache && data && !error) {
      cacheResponse(response, query, _variables);
    }
    cacheImagesFromQuery(data);
  } else {
    // return a new reference to the data object, so reference equality check in React components/hooks will work
    data = { ...data };
  }

  return {
    data,
    error,
  };
}
