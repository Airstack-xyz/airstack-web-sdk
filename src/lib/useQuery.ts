import { useCallback, useEffect } from "react";
import { fetchQuery } from "./fetchQuery";
import { FetchQueryReturnType } from "./types";
import { useRequestState } from "./useDataState";

type UseQueryReturnType = {
    data: any,
    error: any,
    loading: boolean,
}

export function useQuery (query: string, variables: any): UseQueryReturnType {
    const {data, error, loading, setData, setError, setLoading} = useRequestState();

    const handleResponse = useCallback((res: Awaited<FetchQueryReturnType>) => {
        if(!res) return;
        const {data, error} = res;
        setData(data);
        setError(error);
        setLoading(false);
    }, [setData, setError, setLoading]);

    const fetch = useCallback(async () => {
        const res = await fetchQuery(query, variables);
        handleResponse(res); 
    }, [handleResponse, query, variables]);

    useEffect(() => {
        fetch();
    }, [fetch])

    return {data, error, loading}
}
