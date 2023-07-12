import { fetchGql } from "../utils/fetcher";
import {
  Config,
  FetchPaginatedQueryReturnType,
  FetchQuery,
  ResponseType,
  Variables,
} from "../types";
import { cacheResponse, getFromCache } from "../cache";
import { getPaginationData } from "../utils/getPaginationData";
import { stringifyObjectValues } from "../utils/stringifyObjectValues";
import { removeQueriesIfNoNextPage } from "../utils/removeQueriesIfNoNextPage";
import { config as globalConfig } from "../config";
import { cacheImagesFromQuery } from "../utils/cacheImagesFromQuery";

export async function fetchPaginatedQuery(
  originalQuery: string,
  variables?: Variables,
  config?: Config
): FetchPaginatedQueryReturnType {
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
  let inProgressRequest: Promise<FetchQuery> | null = null;

  async function fetch(
    _query: string,
    _variables?: Variables,
    _config?: Config
  ): FetchPaginatedQueryReturnType {
    const variables: Variables = stringifyObjectValues(_variables || {});
    const config = { cache: globalConfig.cache, ..._config };

    let data: null | ResponseType = config.cache
      ? getFromCache(_query, variables || {})
      : null;
    let error = null;

    if (!data) {
      const [response, _error] = await fetchGql<any>(_query, variables);
      data = response;
      error = _error;
      if (config.cache && data && !error) {
        cacheResponse(response, _query, variables);
      }
      cacheImagesFromQuery(data);
    } else {
      // return a new reference to the data object, so reference equality check in React components/hooks will work
      data = { ...data };
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
    if (inProgressRequest) {
      return inProgressRequest;
    }

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

      inProgressRequest = fetch(
        query,
        {
          ...variables,
          ...paginationData.nextCursors,
        },
        config
      ).finally(() => {
        inProgressRequest = null;
      });

      return inProgressRequest;
    }
    return null;
  };

  const handlePrev = async () => {
    if (inProgressRequest) {
      return inProgressRequest;
    }

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

      inProgressRequest = fetch(
        query,
        {
          ...variables,
          ...cursors,
        },
        config
      ).finally(() => {
        inProgressRequest = null;
      });

      return inProgressRequest;
    }
    return null;
  };

  return fetch(query, variables, config);
}
