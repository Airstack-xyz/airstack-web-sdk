import { useState, useRef, useCallback, useEffect } from "react";
import { fetchQuery } from "./fetchQuery";
import { FetchQuery, FetchQueryReturnType } from "./types";
import { useRequestState } from "./useDataState";

type UseQueryReturnType = {
    data: any,
    error: any,
    loading: boolean,
    hasNextPage,
    hasPrevPage,
    getNextPage: () => Promise<void>,
    getPrevPage: () => Promise<void>,
}

export function useQueryWithPagination (query: string, variables: any): UseQueryReturnType {
    const {data, error, loading, setData, setError, setLoading} = useRequestState();
    const [hasNextPage, setHasNextPage ] = useState(false);
    const [hasPrevPage, setHasPrevPage] = useState(false);
    const nextRef = useRef<null | (() => Promise<FetchQuery | null>)>(null);
    const prevRef = useRef<null | (() => Promise<FetchQuery | null>)>(null);
    
    const handleResponse = useCallback((res: null | Awaited<FetchQueryReturnType>) => {
        if(!res) return;
        const {data, error, next, prev, hasNextPage, hasPrevPage} = res;
        nextRef.current = next;
        prevRef.current = prev;
        setData(data);
        setError(error);
        setLoading(false);
        setHasNextPage(hasNextPage);
        setHasPrevPage(hasPrevPage);
    }, [setData, setError, setLoading]);

    const fetch = useCallback(async () => {
        const res = await fetchQuery(query, variables);
        handleResponse(res); 
    }, [handleResponse, query, variables]);

    const getNextPage = useCallback(async () => {
        if(!nextRef.current) return;
        setLoading(true);
        const res = await nextRef.current();
        handleResponse(res);
    }, [handleResponse, setLoading]);

    const getPrevPage = useCallback(async () => {
        if(!prevRef.current) return;
        setLoading(true);
        const res = await prevRef.current();
        handleResponse(res);
    }, [handleResponse, setLoading]);

    useEffect(() => {
        fetch();
    }, [fetch])

    return {data, error, loading, hasNextPage, hasPrevPage, getNextPage, getPrevPage}
}
