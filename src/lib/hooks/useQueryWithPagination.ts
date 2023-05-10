import { useState, useRef, useCallback, useEffect } from "react";
import { fetchQuery } from "../apis/fetchQuery";
import { Config, FetchQuery, FetchQueryReturnType, Variables } from "../types";
import { useRequestState } from "./useDataState";

type UseQueryReturnType = {
  data: any;
  error: any;
  loading: boolean;
  hasNextPage;
  hasPrevPage;
  getNextPage: () => Promise<void>;
  getPrevPage: () => Promise<void>;
};

type UseLazyQueryWithPaginationReturnType = [
  (
    query?: string,
    variables?: Variables
  ) => Promise<
    Omit<UseQueryReturnType, "loading" | "getNextPage" | "getPrevPage">
  >,
  UseQueryReturnType
];

export function useLazyQueryWithPagination(
  query: string,
  variables?: Variables,
  config?: Config
): UseLazyQueryWithPaginationReturnType {
  const { data, error, loading, setData, setError, setLoading, configRef } =
    useRequestState(config);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const nextRef = useRef<null | (() => Promise<FetchQuery | null>)>(null);
  const prevRef = useRef<null | (() => Promise<FetchQuery | null>)>(null);

  const handleResponse = useCallback(
    (res: null | Awaited<FetchQueryReturnType>) => {
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

  const fetch = useCallback(
    async (_query?: string, _variables?: any) => {
      setLoading(true);
      const res = await fetchQuery(
        _query || query,
        _variables || variables,
        configRef.current
      );
      handleResponse(res);
      const { data, error, hasNextPage, hasPrevPage } = res;
      return { data, error, hasNextPage, hasPrevPage };
    },
    [configRef, handleResponse, query, setLoading, variables]
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
      hasNextPage,
      hasPrevPage,
      getNextPage,
      getPrevPage,
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
