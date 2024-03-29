import { fetchGql } from "../utils/fetcher";
import {
  Config,
  FetchPaginatedQueryReturnType,
  FetchQuery,
  ResponseType,
  VariablesType,
} from "../types";
import { cacheResponse, getFromCache } from "../cache";
import { getPaginationData } from "../utils/getPaginationData";
import { stringifyObjectValues } from "../utils/stringifyObjectValues";
import { removeQueriesIfNoNextPage } from "../utils/removeQueriesIfNoNextPage";
import { config as globalConfig } from "../config";
import { cacheImagesFromQuery } from "../utils/cacheImagesFromQuery";

export async function fetchPaginatedQuery<D = ResponseType>(
  originalQuery: string,
  variables?: VariablesType,
  config?: Config
): FetchPaginatedQueryReturnType<D> {
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
  let inProgressRequest: Promise<FetchQuery<D>> | null = null;

  async function fetch(
    _query: string,
    _variables?: VariablesType,
    _config?: Config
  ): FetchPaginatedQueryReturnType<D> {
    const variables: VariablesType = stringifyObjectValues(_variables || {});
    const config = { cache: globalConfig.cache, ..._config };

    let data: null | D = config.cache
      ? getFromCache(_query, variables || {})
      : null;
    let error = null;
    const aboardController = _config?.abortController;
    if (!data) {
      const [response, _error] = await fetchGql<any>(
        _query,
        variables,
        aboardController
      );
      data = response;
      error = _error;

      if (config.cache && data && !error) {
        cacheResponse(response, _query, variables);
      }

      cacheImagesFromQuery(data as any);
    } else {
      // return a new reference to the data object, so reference equality check in React components/hooks will work
      data = { ...data };
    }

    // If the request was aborted, don't update the pagination data, so we can make the request again when the user clicks on the next/prev page button.
    if (!aboardController?.signal.aborted) {
      paginationData = getPaginationData(data);
      lastResponse = data;
    }

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
      const updatedQuery = await removeQueriesIfNoNextPage(
        query,
        lastResponse as ResponseType
      );
      deletedQueryCache.push(
        updatedQuery
          ? {
              query,
              cursors: paginationData.nextCursors,
            }
          : null
      );
      if (updatedQuery) {
        query = updatedQuery;
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
