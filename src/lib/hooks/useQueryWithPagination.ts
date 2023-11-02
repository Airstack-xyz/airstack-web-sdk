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
  const hasNextPageRef = useRef(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const hasPrevPageRef = useRef(false);
  const nextRef = useRef<
    null | (() => Promise<FetchQuery<ResponseType> | null>)
  >(null);
  const prevRef = useRef<
    null | (() => Promise<FetchQuery<ResponseType> | null>)
  >(null);

  const { cancelRequestOnUnmount } = configRef.current || {};
  const shouldCancelRequestOnUnmount =
    cancelRequestOnUnmount === undefined
      ? config.cancelHookRequestsOnUnmount
      : cancelRequestOnUnmount;

  const reset = useCallback(() => {
    nextRef.current = null;
    prevRef.current = null;
    setData(null);
    setError(null);
    setLoading(false);
    hasNextPageRef.current = false;
    setHasNextPage(false);
    hasPrevPageRef.current = false;
    setHasPrevPage(false);
  }, [setData, setError, setLoading]);

  const handleResponse = useCallback(
    (
      response: null | Awaited<FetchPaginatedQueryReturnType<ResponseType>>,
      abortController: AbortController
    ) => {
      const isResponseForAbortedRequest = abortController.signal.aborted;
      // make sure the data remains null if the response is for an aborted request, this will make sure the onCompleted callback is called with null value
      const res = isResponseForAbortedRequest ? null : response;

      let data: ReturnType<Formatter> | null = null;
      let error = null;
      let hasNextPage = isResponseForAbortedRequest
        ? hasNextPageRef.current
        : false;
      let hasPrevPage = isResponseForAbortedRequest
        ? hasPrevPageRef.current
        : false;

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
      hasNextPageRef.current = hasNextPage;
      setHasNextPage(hasNextPage);
      hasPrevPageRef.current = hasPrevPage;
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

  const abortRequest = useCallback(() => {
    if (configRef.current.abortController && shouldCancelRequestOnUnmount) {
      configRef.current.abortController.abort();
    }
  }, [configRef, shouldCancelRequestOnUnmount]);

  const cancelRequest = useCallback(() => {
    if (configRef.current.abortController) {
      configRef.current.abortController.abort();
    }
  }, [configRef]);

  const updateAbortController = useCallback(() => {
    // create a new abort controller only if the previous one is aborted
    const abortController =
      !configRef.current.abortController ||
      configRef.current.abortController.signal.aborted
        ? new AbortController()
        : configRef.current.abortController;

    configRef.current.abortController = abortController;

    return abortController;
  }, [configRef]);

  const fetch: FetchType<ReturnType<Formatter>, Variables> = useCallback(
    async (_variables?: Variables) => {
      reset();

      const abortController = updateAbortController();
      setLoading(true);

      const queryWithPagination = await addPaginationToQuery(query);

      const res = await fetchPaginatedQuery<ResponseType>(
        queryWithPagination,
        _variables || variablesRef.current,
        // always pass the whole config object to fetchPaginatedQuery
        // this is nessasary because fetchPaginatedQuery will use the abortController from the config object
        // and this also helps us to change the abortController
        // in case user aborts the next/prev page request and then makes a new request next/prev page request
        configRef.current
      );

      return handleResponse(res, abortController);
    },
    [
      configRef,
      handleResponse,
      query,
      reset,
      setLoading,
      updateAbortController,
      variablesRef,
    ]
  );

  const getNextPage = useCallback(async () => {
    if (!nextRef.current) return;
    const abortController = updateAbortController();
    setLoading(true);
    const res = await nextRef.current();
    handleResponse(res, abortController);
  }, [handleResponse, setLoading, updateAbortController]);

  const getPrevPage = useCallback(async () => {
    if (!prevRef.current) return;
    const abortController = updateAbortController();
    setLoading(true);
    const res = await prevRef.current();
    handleResponse(res, abortController);
  }, [handleResponse, setLoading, updateAbortController]);

  // cleanup, cancel request on unmount
  useEffect(() => abortRequest, [abortRequest]);

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
