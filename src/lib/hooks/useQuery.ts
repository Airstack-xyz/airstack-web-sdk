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
    (
      response: null | Awaited<FetchQueryReturnType<ResponseType>>,
      abortController: AbortController
    ) => {
      const isResponseForAbortedRequest = abortController.signal.aborted;
      // make sure the data remains null if the response is for an aborted request, this will make sure the onCompleted callback is called with null value
      const res = isResponseForAbortedRequest ? null : response;
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

      // do not update data and error if the response is for an aborted request
      // also do not call the callbacks
      if (!isResponseForAbortedRequest) {
        setData(data);
        setError(error);
        if (error) {
          callbacksRef.current.onError(error);
        } else {
          callbacksRef.current.onCompleted(data as ReturnType<Formatter>);
        }
      }
      setLoading(false);

      return {
        data,
        error,
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

  const fetch = useCallback(
    async (_variables?: Variables) => {
      // create a new abort controller only if the previous one is aborted, changing the abort controller
      // even if it is not aborted will will make another api call instead of returning the cached promise
      const abortController =
        !configRef.current.abortController ||
        configRef.current.abortController.signal.aborted
          ? new AbortController()
          : configRef.current.abortController;

      configRef.current.abortController = abortController;

      setError(null);
      setLoading(true);

      const response = await fetchQuery<ResponseType>(
        query,
        _variables || variablesRef.current,
        { ...configRef.current, abortController }
      );

      return handleResponse(response, abortController);
    },
    [setError, setLoading, query, variablesRef, configRef, handleResponse]
  );

  // cleanup, cancel request on unmount
  useEffect(() => abortRequest, [abortRequest]);

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
