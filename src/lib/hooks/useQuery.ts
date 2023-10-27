import { useCallback, useEffect, useRef } from "react";
import { fetchQuery } from "../apis/fetchQuery";
import {
  ConfigAndCallbacks,
  FetchQueryReturnType,
  ResponseType,
  VariablesType,
} from "../types";
import { useRequestState } from "./useDataState";
import { config } from "../config";

type UseQueryReturnType<D> = {
  data: D | null;
  error: any;
  loading: boolean;
  cancelRequest: () => void;
};

type UseLazyQueryReturnType<
  D extends ResponseType,
  Variables extends VariablesType
> = [
  (
    variables?: Variables
  ) => Promise<Omit<UseQueryReturnType<D>, "loading" | "cancelRequest">>,
  UseQueryReturnType<D>
];

export function useLazyQuery<
  ReturnedData = ResponseType,
  Variables extends VariablesType = VariablesType,
  Formatter extends (data: ResponseType) => ReturnedData = (
    data: ResponseType
  ) => ReturnedData
>(
  query: string,
  variables?: Variables,
  configAndCallbacks?: ConfigAndCallbacks<ReturnedData, Formatter>
): UseLazyQueryReturnType<ReturnType<Formatter>, Variables> {
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

  const handleResponse = useCallback(
    (res: Awaited<FetchQueryReturnType<ResponseType>>) => {
      let data: ReturnType<Formatter> | null = null;
      let error = null;

      if (res) {
        const { data: rawData, error: _error } = res;
        originalData.current = rawData;
        data = rawData
          ? (callbacksRef.current.dataFormatter(
              rawData
            ) as ReturnType<Formatter>)
          : null;
        error = _error;
      }

      setData(data);
      setError(error);
      setLoading(false);
      if (error) {
        callbacksRef.current.onError(error);
      } else {
        callbacksRef.current.onCompleted(data as ReturnType<Formatter>);
      }
      return {
        data,
        error,
      };
    },
    [callbacksRef, originalData, setData, setError, setLoading]
  );

  const fetch = useCallback(
    async (_variables?: Variables) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      setError(null);
      setLoading(true);
      const res = await fetchQuery<ResponseType>(
        query,
        _variables || variablesRef.current,
        { ...configRef.current, abortController: abortControllerRef.current }
      );
      return handleResponse(res);
    },
    [setError, setLoading, query, variablesRef, configRef, handleResponse]
  );

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

  return [fetch, { data, error, loading, cancelRequest }];
}

export function useQuery<
  ReturnedData = ResponseType,
  Variables extends VariablesType = VariablesType,
  Formatter extends (data: ResponseType) => ReturnedData = (
    data: ResponseType
  ) => ReturnedData
>(
  query: string,
  variables?: Variables,
  configAndCallbacks?: ConfigAndCallbacks<ReturnedData, Formatter>
): UseQueryReturnType<ReturnedData> {
  const [fetch, { data, error, loading, cancelRequest }] = useLazyQuery<
    ReturnedData,
    Variables,
    Formatter
  >(query, variables, configAndCallbacks);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, error, loading, cancelRequest };
}
