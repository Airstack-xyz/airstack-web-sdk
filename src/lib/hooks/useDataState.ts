import { useRef, useState } from "react";
import {
  Config,
  ConfigAndCallbacks,
  ResponseType,
  VariablesType,
} from "../types";

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

function defaultDataFormatter(data: any) {
  return data;
}

export function useRequestState<
  ReturnedData extends ResponseType,
  Variables,
  Formatter
>(
  variables?: Variables,
  configAndCallbacks?: ConfigAndCallbacks<ReturnedData, Formatter>
) {
  const [data, setData] = useState<ReturnedData | null>(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const configRef = useRef<Config | undefined>(configAndCallbacks);
  const variablesRef = useRef<VariablesType>(variables || {});
  const callbacksRef = useRef<
    Required<Omit<ConfigAndCallbacks<ReturnedData, Formatter>, "cache">>
  >({
    onCompleted: noop,
    onError: noop,
    dataFormatter: defaultDataFormatter as Formatter,
  });
  const originalData = useRef<any>(null);

  const {
    onCompleted = noop,
    onError = noop,
    dataFormatter = defaultDataFormatter,
    ...config
  } = configAndCallbacks || {};

  configRef.current = { ...configRef.current, ...config }; // update configRef.current when configAndCallbacks changes
  variablesRef.current = variables || {}; // update variablesRef.current when variables changes
  callbacksRef.current = {
    ...callbacksRef.current,
    onCompleted,
    onError,
    dataFormatter: dataFormatter as Formatter,
  }; // update callbacksRef.current when configAndCallbacks changes

  return {
    data,
    error,
    loading,
    setData,
    setError,
    setLoading,
    configRef,
    variablesRef,
    originalData,
    callbacksRef,
  };
}
