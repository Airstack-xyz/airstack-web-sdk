import { useRef, useState } from "react";
import { Config } from "./types";

export function useRequestState(config?: Config) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const configRef = useRef<Config | undefined>(config);
  return { data, error, loading, setData, setError, setLoading, configRef };
}
