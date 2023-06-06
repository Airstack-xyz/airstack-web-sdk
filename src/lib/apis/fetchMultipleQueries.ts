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
import { removeQueriesIfNoNextPage } from "../utils/removeQueriesIfNoNextPage";

const defaultConfig: Config = {
  cache: true,
};

export async function fetchMultipleQueries(
  originalQuery: string,
  variables?: Variables,
  config?: Config
): FetchQueryReturnType {
  let query = originalQuery;
  const nextCursorsCache: Record<string, string>[] = [];
  const deletedQueryCache: (null | {
    query: string;
    cursors: Record<string, string>;
  })[] = [];

  let paginationData: ReturnType<typeof getPaginationData> = {
    hasNextPage: false,
    hasPrevPage: false,
    nextCursors: {},
    prevCursors: {},
  };
  let lastResponse: ResponseType | null = null;

  async function fetch(
    _query: string,
    _variables?: Variables,
    _config?: Config
  ): FetchQueryReturnType {
    const variables: Variables = stringifyObjectValues(_variables || {});
    const config = { ...defaultConfig, ..._config };

    let data: null | ResponseType = config.cache
      ? getFromCache(_query, variables || {})
      : null;
    let error = null;

    if (!data) {
      const [response, _error] = await fetchGql<any>(_query, variables);
      data = response;
      error = _error;
      if (config.cache && data && !error) {
        chacheResponse(response, _query, variables);
      }
    }

    paginationData = getPaginationData(data);
    lastResponse = data;

    return {
      data,
      error,
      hasNextPage: paginationData.hasNextPage,
      hasPrevPage: paginationData.hasPrevPage,
      getNextPage: handleNext,
      getPrevPage: handlePrev,
    };
  }

  const handleNext = async () => {
    if (paginationData.hasNextPage) {
      nextCursorsCache.push(paginationData.nextCursors);
      const upatedQuery = await removeQueriesIfNoNextPage(
        query,
        lastResponse as ResponseType
      );
      deletedQueryCache.push(
        upatedQuery
          ? {
              query,
              cursors: paginationData.nextCursors,
            }
          : null
      );
      if (upatedQuery) {
        query = upatedQuery;
      }

      return await fetch(
        query,
        {
          ...variables,
          ...paginationData.nextCursors,
        },
        config
      );
    }
    return null;
  };

  const handlePrev = async () => {
    if (paginationData.hasPrevPage) {
      nextCursorsCache.pop();

      const { query: deletedQuery } = deletedQueryCache.pop() || {};

      let cachedCursors: Record<string, string> = {};
      let cursors = {};

      if (deletedQuery) {
        // If the previous page query was deleted, we can't use cursors returned by that query to retrieve the previous page.
        // The cursors used in the deleted query brought us to the current page where the query was removed.
        // Therefore, we need to use the next cursors from the query preceding the deleted query to navigate to the previous page.
        cachedCursors = nextCursorsCache.pop() || {};
        deletedQueryCache.pop();
        query = deletedQuery;
        cursors = { ...cachedCursors };
      } else {
        cursors = { ...cachedCursors, ...paginationData.prevCursors };
      }

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

  return fetch(query, variables, config);
}
