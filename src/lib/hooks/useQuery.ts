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

  const { cancelRequestOnUnmount } = configRef.current || {};
  const shouldCancelRequestOnUnmount =
    cancelRequestOnUnmount === undefined
      ? config.cancelHookRequestsOnUnmount
      : cancelRequestOnUnmount;

  const handleResponse = useCallback(
    (res: null | Awaited<FetchQueryReturnType<ResponseType>>) => {
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

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current && shouldCancelRequestOnUnmount) {
      abortControllerRef.current.abort();
    }
  }, [shouldCancelRequestOnUnmount]);

  const fetch = useCallback(
    async (_variables?: Variables) => {
      cancelRequest();

      // create a new abort controller only if the previous one is aborted, changing the abort controller
      // even if it is not aborted will will make another api call instead of returning the cached promise
      const _abortController =
        !abortControllerRef.current || abortControllerRef.current.signal.aborted
          ? new AbortController()
          : abortControllerRef.current;

      abortControllerRef.current = _abortController;

      setError(null);
      setLoading(true);

      const res = await fetchQuery<ResponseType>(
        query,
        _variables || variablesRef.current,
        { ...configRef.current, abortController: abortControllerRef.current }
      );

      const isResponseForAbortedRequest = _abortController.signal.aborted;
      // make sure the data remains null if the response is for an aborted request, this will make sure the onCompleted callback is called with null value
      const response = isResponseForAbortedRequest ? null : res;

      return handleResponse(response);
    },
    [
      cancelRequest,
      setError,
      setLoading,
      query,
      variablesRef,
      configRef,
      handleResponse,
    ]
  );

  // cleanup, cancel request on unmount
  useEffect(() => cancelRequest, [cancelRequest]);

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
