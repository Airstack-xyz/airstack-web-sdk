import { useState, useRef, useCallback, useEffect } from "react";
import { fetchQuery } from "../apis/fetchQuery";
import { Config, FetchQuery, FetchQueryReturnType, Variables } from "../types";
import { useRequestState } from "./useDataState";
import { addPaginationFieldToQuery } from "../utils/addPaginationFieldToQuery";

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

  const fetch: FetchType = useCallback(
    async (_variables?: Variables) => {
      setError(null);
      setLoading(true);

      const queryWithPaginationField = addPaginationFieldToQuery(query);

      const res = await fetchQuery(
        queryWithPaginationField,
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
