import { useRef, useState } from "react";
import { Config, ConfigAndCallbacks, Variables } from "../types";

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() { }

function defaultDataFormatter(data: any) { return data; }

export function useRequestState(variables?: Variables, configAndCallbacks?: ConfigAndCallbacks) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const configRef = useRef<Config | undefined>(configAndCallbacks);
  const variablesRef = useRef<Variables>(variables || {});
  const callbacksRef = useRef<Required<Omit<ConfigAndCallbacks, 'cache'>>>({
    onCompleted: noop,
    onError: noop,
    dataFormatter: defaultDataFormatter,

  });
  const originalData = useRef<any>(null);

  const { onCompleted = noop, onError = noop, dataFormatter = defaultDataFormatter, ...config } = configAndCallbacks || {};

  configRef.current = { ...configRef.current, ...config }; // update configRef.current when configAndCallbacks changes
  variablesRef.current = variables || {}; // update variablesRef.current when variables changes
  callbacksRef.current = { ...callbacksRef.current, onCompleted, onError, dataFormatter: dataFormatter }; // update callbacksRef.current when configAndCallbacks changes

  return { data, error, loading, setData, setError, setLoading, configRef, variablesRef, originalData, callbacksRef };
}