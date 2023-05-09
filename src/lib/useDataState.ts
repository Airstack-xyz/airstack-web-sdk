import { useState } from "react";

export function useRequestState () {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    return {data, error, loading, setData, setError, setLoading}
}