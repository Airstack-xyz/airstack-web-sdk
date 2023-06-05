import { fetchGql } from "../utils/fetcher";
import {
  Config,
  FetchQueryReturnType,
  ResponseType,
  Variables,
} from "../types";
import { chacheResponse, getFromCache } from "../cache";
import { getPaginationData } from "../utils/getPaginationData";
import { stringifyObjectValues } from "../utils/stringifyObjectValues";

const defaultConfig: Config = {
  cache: true,
};

export async function fetchQuery(
  query: string,
  variables?: Variables,
  config?: Config
): FetchQueryReturnType {
  const prevCursorsCache: Record<string, string>[] = [];

  async function fetch(
    query: string,
    _variables?: Variables,
    _config?: Config
  ): FetchQueryReturnType {
    const variables: Variables = stringifyObjectValues(_variables || {});

    const config = { ...defaultConfig, ..._config };

    let data: null | ResponseType = config.cache
      ? getFromCache(query, variables || {})
      : null;
    let error = null;

    if (!data) {
      const [response, _error] = await fetchGql<any>(query, variables);
      data = response;
      error = _error;
      if (config.cache && data && !error) {
        chacheResponse(response, query, variables);
      }
    }

    const { nextCursors, prevCursors, hasNextPage, hasPrevPage } =
      getPaginationData(data);

    const handleNext = async () => {
      if (hasNextPage) {
        prevCursorsCache.push(prevCursors);
        return await fetch(
          query,
          {
            ...variables,
            ...nextCursors,
          },
          config
        );
      }
      return null;
    };

    const handlePrev = async () => {
      if (hasPrevPage) {
        const savedPrevCursors = prevCursorsCache.pop() || {};
        const cursors = { ...savedPrevCursors, ...prevCursors };

        return await fetch(
          query,
          {
            ...variables,
            ...cursors,
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
  return fetch(query, variables, config);
}
