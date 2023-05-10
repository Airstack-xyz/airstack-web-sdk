import { fetchGql } from "../utils/fetcher";
import {
  Config,
  FetchQueryReturnType,
  ResponseType,
  Variables,
} from "../types";
import { chacheResponse, getFromCache } from "../cache";

const defaultConfig: Config = {
  cache: true,
};

export async function fetchQuery(
  query: string,
  variables?: Variables,
  _config?: Config
): FetchQueryReturnType {
  const _variables: Variables = {};
  for (const key in variables) {
    if (typeof variables[key] === "object") {
      _variables[key] = JSON.stringify(variables[key]);
    } else {
      _variables[key] = variables[key];
    }
  }

  const config = { ...defaultConfig, ..._config };

  let data: null | ResponseType = config.cache
    ? getFromCache(query, _variables || {})
    : null;
  let error = null;

  if (!data) {
    const [response, _error] = await fetchGql<any>(query, _variables);
    data = response;
    error = _error;
    if (config.cache && data && !error) {
      chacheResponse(response, query, _variables);
    }
  }

  const pageInfo = data ? data[Object.keys(data || {})[0]]?.pageInfo : null;
  const hasNextPage = Boolean(pageInfo?.nextCursor);
  const hasPrevPage = Boolean(pageInfo?.prevCursor);

  const handleNext = async () => {
    if (hasNextPage) {
      return await fetchQuery(
        query,
        {
          ..._variables,
          cursor: pageInfo?.nextCursor,
        },
        config
      );
    }
    return null;
  };

  const handlePrev = async () => {
    if (hasPrevPage) {
      return await fetchQuery(
        query,
        {
          ..._variables,
          cursor: pageInfo?.prevCursor,
        },
        config
      );
    }
    return null;
  };

  return {
    data,
    error,
    hasNextPage,
    hasPrevPage,
    getNextPage: handleNext,
    getPrevPage: handlePrev,
  };
}
