import { useState, useRef, useCallback, useEffect } from "react";
import {
  Config,
  FetchQuery,
  FetchPaginatedQueryReturnType,
  Variables,
} from "../types";
import { useRequestState } from "./useDataState";
import { addPaginationToQuery } from "../utils/addPaginationToQuery";
import { fetchPaginatedQuery } from "../apis/fetchPaginatedQuery";

type BaseReturnType = {
  data: any;
  error: any;
};
type Pagination = {
  hasNextPage: boolean;
  hasPrevPage: boolean;
  getNextPage: () => Promise<void>;
  getPrevPage: () => Promise<void>;
};

type UseQueryReturnType = BaseReturnType & {
  loading: boolean;
  pagination: Pagination;
};

type FetchType = (variables?: Variables) => Promise<
  BaseReturnType & {
    pagination: Omit<Pagination, "getNextPage" | "getPrevPage">;
  }
>;

type LazyHookReturnType = [FetchType, UseQueryReturnType];

export function useLazyQueryWithPagination(
  query: string,
  variables?: Variables,
  config?: Config
): LazyHookReturnType {
  const { data, error, loading, setData, setError, setLoading, configRef } =
    useRequestState(config);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const nextRef = useRef<null | (() => Promise<FetchQuery | null>)>(null);
  const prevRef = useRef<null | (() => Promise<FetchQuery | null>)>(null);
  const variablesRef = useRef<Variables>(variables || {});

  const handleResponse = useCallback(
    (res: null | Awaited<FetchPaginatedQueryReturnType>) => {
      if (!res) return;
      const {
        data,
        error,
        getNextPage,
        getPrevPage,
        hasNextPage,
        hasPrevPage,
      } = res;
      nextRef.current = getNextPage;
      prevRef.current = getPrevPage;
      setData(data);
      setError(error);
      setLoading(false);
      setHasNextPage(hasNextPage);
      setHasPrevPage(hasPrevPage);
    },
    [setData, setError, setLoading]
  );

  const fetch: FetchType = useCallback(
    async (_variables?: Variables) => {
      setError(null);
      setLoading(true);

      const queryWithPagination = await addPaginationToQuery(query);

      const res = await fetchPaginatedQuery(
        queryWithPagination,
        _variables || variablesRef.current,
        configRef.current
      );
      handleResponse(res);
      const { data, error, hasNextPage, hasPrevPage } = res;
      return {
        data,
        error,
        pagination: {
          hasNextPage,
          hasPrevPage,
        },
      };
    },
    [configRef, handleResponse, query, setError, setLoading]
  );

  const getNextPage = useCallback(async () => {
    if (!nextRef.current) return;
    setLoading(true);
    const res = await nextRef.current();
    handleResponse(res);
  }, [handleResponse, setLoading]);

  const getPrevPage = useCallback(async () => {
    if (!prevRef.current) return;
    setLoading(true);
    const res = await prevRef.current();
    handleResponse(res);
  }, [handleResponse, setLoading]);

  return [
    fetch,
    {
      data,
      error,
      loading,
      pagination: {
        hasNextPage,
        hasPrevPage,
        getNextPage,
        getPrevPage,
      },
    },
  ];
}

export function useQueryWithPagination(
  query: string,
  variables?: Variables,
  config?: Config
): UseQueryReturnType {
  const [fetch, data] = useLazyQueryWithPagination(query, variables, config);
  useEffect(() => {
    fetch();
  }, [fetch]);

  return data;
}
