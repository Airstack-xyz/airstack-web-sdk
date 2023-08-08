import { useCallback, useEffect } from "react";
import { fetchQuery } from "../apis/fetchQuery";
import { ConfigAndCallbacks, FetchQueryReturnType, Variables } from "../types";
import { useRequestState } from "./useDataState";

type UseQueryReturnType = {
  data: any;
  error: any;
  loading: boolean;
};

type UseLazyQueryReturnType = [
  (variables?: Variables) => Promise<Omit<UseQueryReturnType, "loading">>,
  UseQueryReturnType
];

export function useLazyQuery(
  query: string,
  variables?: Variables,
  configAndCallbacks?: ConfigAndCallbacks
): UseLazyQueryReturnType {
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
    (res: Awaited<FetchQueryReturnType>) => {
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
      const res = await fetchQuery(
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

export function useQuery(
  query: string,
  variables?: Variables,
  configAndCallbacks?: ConfigAndCallbacks
): UseQueryReturnType {
  const [fetch, { data, error, loading }] = useLazyQuery(
    query,
    variables,
    configAndCallbacks
  );

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, error, loading };
}
