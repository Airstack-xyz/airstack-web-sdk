import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  FetchQuery,
  FetchPaginatedQueryReturnType,
  VariablesType,
  ConfigAndCallbacks,
  ResponseType,
} from "../types";
import { useRequestState } from "./useDataState";
import { addPaginationToQuery } from "../utils/addPaginationToQuery";
import { fetchPaginatedQuery } from "../apis/fetchPaginatedQuery";
import { config } from "../config";

type BaseReturnType<D> = {
  data: null | D;
  error: any;
};
type Pagination = {
  hasNextPage: boolean;
  hasPrevPage: boolean;
  getNextPage: () => Promise<void>;
  getPrevPage: () => Promise<void>;
};

type UseQueryReturnType<D> = BaseReturnType<D> & {
  loading: boolean;
  pagination: Pagination;
  cancelRequest: () => void;
};

type FetchType<D extends ResponseType, V extends VariablesType> = (
  variables?: V
) => Promise<
  BaseReturnType<D> & {
    pagination: Omit<Pagination, "getNextPage" | "getPrevPage">;
  }
>;

type LazyHookReturnType<D extends ResponseType, V extends VariablesType> = [
  FetchType<D, V>,
  UseQueryReturnType<D>
];

export function useLazyQueryWithPagination<
  ReturnedData = ResponseType,
  Variables extends VariablesType = VariablesType,
  Formatter extends (data: ResponseType) => ReturnedData = (
    data: ResponseType
  ) => ReturnedData
>(
  query: string,
  variables?: Variables,
  configAndCallbacks?: ConfigAndCallbacks<ReturnedData, Formatter>
): LazyHookReturnType<ReturnType<Formatter>, Variables> {
  const abortControllerRef = useRef<AbortController | null>(null);
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
  } = useRequestState<ReturnType<Formatter>, Variables, Formatter>(
    variables,
    configAndCallbacks
  );
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const nextRef = useRef<
    null | (() => Promise<FetchQuery<ResponseType> | null>)
  >(null);
  const prevRef = useRef<
    null | (() => Promise<FetchQuery<ResponseType> | null>)
  >(null);

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
    (res: null | Awaited<FetchPaginatedQueryReturnType<ResponseType>>) => {
      let data: ReturnType<Formatter> | null = null;
      let error = null;
      let hasNextPage = false;
      let hasPrevPage = false;

      if (res) {
        const { data: rawData, getNextPage, getPrevPage } = res;

        nextRef.current = getNextPage;
        prevRef.current = getPrevPage;
        originalData.current = rawData;
        data = rawData
          ? (callbacksRef.current.dataFormatter(
              rawData
            ) as ReturnType<Formatter>)
          : null;
        error = res.error;
        hasNextPage = res.hasNextPage;
        hasPrevPage = res.hasPrevPage;
      }

      setData(data);
      setError(error);
      setLoading(false);
      setHasNextPage(hasNextPage);
      setHasPrevPage(hasPrevPage);
      if (error) {
        callbacksRef.current.onError(error);
      } else {
        callbacksRef.current.onCompleted(data as ReturnType<Formatter>);
      }
      return {
        data,
        error,
        pagination: {
          hasNextPage,
          hasPrevPage,
        },
      };
    },
    [callbacksRef, originalData, setData, setError, setLoading]
  );

  const fetch: FetchType<ReturnType<Formatter>, Variables> = useCallback(
    async (_variables?: Variables) => {
      reset();

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const _abortController = new AbortController();
      abortControllerRef.current = _abortController;

      setLoading(true);

      const queryWithPagination = await addPaginationToQuery(query);

      const res = await fetchPaginatedQuery<ResponseType>(
        queryWithPagination,
        _variables || variablesRef.current,
        {
          ...configRef.current,
          abortController: abortControllerRef.current,
        }
      );

      const isResponseForAbortedRequest =
        _abortController !== abortControllerRef.current;

      // make sure the data remains null if the response is for an aborted request, this will make sure the onCompleted callback is called with null value
      const response = isResponseForAbortedRequest ? null : res;

      return handleResponse(response);
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

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // cleanup, cancel request on unmount if global or hook config says so
  useEffect(
    () => () => {
      const { cancelRequestOnUnmount } = configRef.current || {};
      if (
        cancelRequestOnUnmount === undefined
          ? config.cancelHookRequestsOnUnmount
          : cancelRequestOnUnmount
      ) {
        cancelRequest();
      }
    },
    [cancelRequest, configRef]
  );

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
        cancelRequest,
      },
    ];
  }, [
    cancelRequest,
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

export function useQueryWithPagination<
  ReturnedData = ResponseType,
  Variables extends VariablesType = VariablesType,
  Formatter extends (data: ResponseType) => ReturnedData = (
    data: ResponseType
  ) => ReturnedData
>(
  query: string,
  variables?: Variables,
  configAndCallbacks?: ConfigAndCallbacks<ReturnedData, Formatter>
): UseQueryReturnType<ReturnType<Formatter>> {
  const [fetch, data] = useLazyQueryWithPagination<
    ReturnedData,
    Variables,
    Formatter
  >(query, variables, configAndCallbacks);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return data;
}
