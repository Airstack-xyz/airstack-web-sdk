import { useCallback, useEffect } from "react";
import { fetchQuery } from "../apis/fetchQuery";
import {
  ConfigAndCallbacks,
  FetchQueryReturnType,
  ResponseType,
  Variables,
} from "../types";
import { useRequestState } from "./useDataState";

type UseQueryReturnType<D> = {
  data: D | null;
  error: any;
  loading: boolean;
};

type UseLazyQueryReturnType<D extends ResponseType> = [
  (variables?: Variables) => Promise<Omit<UseQueryReturnType<D>, "loading">>,
  UseQueryReturnType<D>
];

export function useLazyQuery<D extends ResponseType>(
  query: string,
  variables?: Variables,
  configAndCallbacks?: ConfigAndCallbacks
): UseLazyQueryReturnType<D> {
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

  const handleResponse = useCallback(
    (res: Awaited<FetchQueryReturnType<D>>) => {
      if (!res) return;
      const { data: rawData, error } = res;
      originalData.current = rawData;
      const data = rawData ? callbacksRef.current.dataFormatter(rawData) : null;
      setData(data);
      setError(error);
      setLoading(false);
      if (error) {
        callbacksRef.current.onError(error);
        return;
      }
      callbacksRef.current.onCompleted(data);
    },
    [callbacksRef, originalData, setData, setError, setLoading]
  );

  const fetch = useCallback(
    async (_variables?: Variables) => {
      setError(null);
      setLoading(true);
      const res = await fetchQuery<D>(
        query,
        _variables || variablesRef.current,
        configRef.current
      );
      handleResponse(res);
      return { data: res?.data, error: res?.error };
    },
    [setError, setLoading, query, variablesRef, configRef, handleResponse]
  );

  return [fetch, { data, error, loading }];
}

export function useQuery<D extends ResponseType>(
  query: string,
  variables?: Variables,
  configAndCallbacks?: ConfigAndCallbacks
): UseQueryReturnType<D> {
  const [fetch, { data, error, loading }] = useLazyQuery<D>(
    query,
    variables,
    configAndCallbacks
  );

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, error, loading };
}
