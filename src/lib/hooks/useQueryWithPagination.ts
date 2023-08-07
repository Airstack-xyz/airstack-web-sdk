import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  FetchQuery,
  FetchPaginatedQueryReturnType,
  Variables,
  ConfigAndCallbacks,
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
  configAndCallbacks?: ConfigAndCallbacks
): LazyHookReturnType {
  const {
    data,
    error,
    loading,
    configRef,
    callbacksRef,
    originalData,
    variablesRef,
    setData,
    setError,
    setLoading,
  } = useRequestState(variables, configAndCallbacks);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const nextRef = useRef<null | (() => Promise<FetchQuery | null>)>(null);
  const prevRef = useRef<null | (() => Promise<FetchQuery | null>)>(null);

  const reset = useCallback(() => {
    nextRef.current = null;
    prevRef.current = null;
    setData(null);
    setError(null);
    setLoading(false);
    setHasNextPage(false);
    setHasPrevPage(false);
  }, [setData, setError, setLoading]);

  const handleResponse = useCallback(
    (res: null | Awaited<FetchPaginatedQueryReturnType>) => {
      if (!res) return;
      const {
        data: rawData,
        error,
        getNextPage,
        getPrevPage,
        hasNextPage,
        hasPrevPage,
      } = res;
      nextRef.current = getNextPage;
      prevRef.current = getPrevPage;
      originalData.current = rawData;
      const data = rawData ? callbacksRef.current.dataFormatter(rawData) : null;
      setData(data);
      setError(error);
      setLoading(false);
      setHasNextPage(hasNextPage);
      setHasPrevPage(hasPrevPage);
      if (error) {
        callbacksRef.current.onError(error);
        return;
      }
      callbacksRef.current.onCompleted(data);
    },
    [callbacksRef, originalData, setData, setError, setLoading]
  );

  const fetch: FetchType = useCallback(
    async (_variables?: Variables) => {
      reset();
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
    [configRef, handleResponse, query, reset, setLoading, variablesRef]
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

  return useMemo(() => {
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
  }, [
    data,
    error,
    fetch,
    getNextPage,
    getPrevPage,
    hasNextPage,
    hasPrevPage,
    loading,
  ]);
}

export function useQueryWithPagination(
  query: string,
  variables?: Variables,
  configAndCallbacks?: ConfigAndCallbacks
): UseQueryReturnType {
  const [fetch, data] = useLazyQueryWithPagination(
    query,
    variables,
    configAndCallbacks
  );
  useEffect(() => {
    fetch();
  }, [fetch]);

  return data;
}
