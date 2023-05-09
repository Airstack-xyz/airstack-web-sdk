import { useCallback, useEffect } from "react";
import { fetchQuery } from "./fetchQuery";
import { Config, FetchQueryReturnType, Variables } from "./types";
import { useRequestState } from "./useDataState";

type UseQueryReturnType = {
  data: any;
  error: any;
  loading: boolean;
};

type UseLazyQueryReturnType = [
  (
    query?: string,
    variables?: Variables
  ) => Promise<Omit<UseQueryReturnType, "loading">>,
  UseQueryReturnType
];

export function useLazyQuery(
  query: string,
  variables?: Variables,
  config?: Config
): UseLazyQueryReturnType {
  const { data, error, loading, setData, setError, setLoading, configRef } =
    useRequestState(config);

  const handleResponse = useCallback(
    (res: Awaited<FetchQueryReturnType>) => {
      if (!res) return;
      const { data, error } = res;
      setData(data);
      setError(error);
      setLoading(false);
    },
    [setData, setError, setLoading]
  );

  const fetch = useCallback(
    async (_query?: string, _variables?: Variables) => {
      setLoading(true);
      const res = await fetchQuery(
        _query || query,
        _variables || variables,
        configRef.current
      );
      handleResponse(res);
      return { data: res?.data, error: res?.error };
    },
    [setLoading, query, variables, configRef, handleResponse]
  );

  return [fetch, { data, error, loading }];
}

export function useQuery(
  query: string,
  variables?: Variables,
  config?: Config
): UseQueryReturnType {
  const [fetch, { data, error, loading }] = useLazyQuery(
    query,
    variables,
    config
  );

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, error, loading };
}
