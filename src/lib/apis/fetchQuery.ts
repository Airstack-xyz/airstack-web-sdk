import { fetchGql } from "../utils/fetcher";
import {
  Config,
  FetchQueryReturnType,
  ResponseType,
  Variables,
} from "../types";
import { chacheResponse, getFromCache } from "../cache";
import isAliasedPageInfo, { getCursorName } from "../utils/cursor";

const defaultConfig: Config = {
  cache: true,
};

function getPaginationData(response: ResponseType | null): {
  nextCursors: Record<string, string>;
  prevCursors: Record<string, string>;
  hasNextPage: boolean;
  hasPrevPage: boolean;
} {
  if (!response)
    return {
      nextCursors: {},
      prevCursors: {},
      hasNextPage: false,
      hasPrevPage: false,
    };

  const nextCursors: Record<string, string> = {};
  const prevCursors: Record<string, string> = {};
  let hasNextPage = false;
  let hasPrevPage = false;
  for (const queryName in response) {
    const query = response[queryName];
    for (const key in query) {
      if (isAliasedPageInfo(key)) {
        const pageInfo = query[key as "pageInfo"];
        nextCursors[getCursorName(key)] = pageInfo.nextCursor;
        prevCursors[getCursorName(key)] = pageInfo.prevCursor;
        if (!hasNextPage) {
          hasNextPage = Boolean(pageInfo.nextCursor);
        }
        if (!hasPrevPage) {
          hasPrevPage = Boolean(pageInfo.prevCursor);
        }
      }
    }
  }
  return {
    nextCursors,
    prevCursors,
    hasNextPage,
    hasPrevPage,
  };
}

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

  const { nextCursors, prevCursors, hasNextPage, hasPrevPage } =
    getPaginationData(data);

  const handleNext = async () => {
    if (hasNextPage) {
      return await fetchQuery(
        query,
        {
          ..._variables,
          ...nextCursors,
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
          ...prevCursors,
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
