import { useCallback, useEffect, useRef, useState } from "react";
import { sendMessageOnXMTP } from "../apis";
import {
  MessagingResult,
  ProgressResult,
  SendMessageOnXmtpParamsType,
  SendMessageParamsType,
  UseLazyMessagingOnXmtpHookParamsType,
  UseLazyMessagingOnXmtpHookReturnType,
  UseMessagingOnXmtpHookParamsType,
  UseMessagingOnXmtpHookReturnType,
} from "../types/xmtp-messaging";

export function useLazyMessagingOnXMTP(
  hookParams: UseLazyMessagingOnXmtpHookParamsType
): UseLazyMessagingOnXmtpHookReturnType {
  const [data, setData] = useState<MessagingResult[] | null>(null);
  const [progress, setProgress] = useState<ProgressResult | null>(null);
  const [error, setError] = useState<unknown>(null);

  const [loading, setLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const hookParamsRef =
    useRef<UseLazyMessagingOnXmtpHookParamsType>(hookParams);

  // store it in refs so that is can be used in callbacks/events
  hookParamsRef.current = hookParams;

  const send = useCallback(async (params?: SendMessageParamsType) => {
    setData(null);
    setProgress(null);
    setError(null);

    setLoading(true);

    // create a new abort controller only if the previous one is aborted
    const abortController =
      !abortControllerRef.current || abortControllerRef.current?.signal?.aborted
        ? new AbortController()
        : abortControllerRef.current;

    abortControllerRef.current = abortController;

    const result = await sendMessageOnXMTP({
      ...hookParamsRef.current,
      ...params,
      abortController: abortControllerRef.current,
      onProgress: (data) => {
        hookParamsRef.current?.onProgress?.(data);
        setProgress(data);
      },
    } as SendMessageOnXmtpParamsType);

    if (!abortControllerRef.current?.signal?.aborted) {
      if (result.error) {
        setError(result.error);
      }
      if (result.data) {
        setData(result.data);
      }
    }

    setLoading(false);

    return result;
  }, []);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    // optimistically stop loading as sendMessageOnXMTP can't be quickly aborted
    setLoading(false);
  }, []);

  // cleanup, call cancel on unmount
  useEffect(() => cancel, [cancel]);

  return [send, { data, progress, error, loading, cancel }];
}

export function useMessagingOnXMTP(
  hookParams: UseMessagingOnXmtpHookParamsType
): UseMessagingOnXmtpHookReturnType {
  const [send, { data, progress, error, loading, cancel }] =
    useLazyMessagingOnXMTP(hookParams);

  useEffect(() => {
    send();
    return () => cancel();
  }, [cancel, send]);

  return { data, progress, error, loading, cancel };
}
