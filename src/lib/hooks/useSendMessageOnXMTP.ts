import { useCallback, useEffect, useRef, useState } from "react";
import { sendMessageOnXMTP } from "../apis";
import {
  MessagingResult,
  ProgressResult,
  SendMessageOnXMTPParamsType,
  SendMessageParamsType,
  UseLazySendMessageOnXMTPParamsType,
  UseLazySendMessageOnXMTPReturnType,
  UseSendMessageOnXMTPParamsType,
  UseSendMessageOnXMTPReturnType,
} from "../types/xmtp-messaging";

export function useLazySendMessageOnXMTP(
  hookParams: UseLazySendMessageOnXMTPParamsType
): UseLazySendMessageOnXMTPReturnType {
  const [data, setData] = useState<MessagingResult[] | null>(null);
  const [progress, setProgress] = useState<ProgressResult | null>(null);
  const [error, setError] = useState<unknown>(null);

  const [loading, setLoading] = useState(false);

  const abortControllerRef = useRef<AbortController>();

  const hookParamsRef = useRef<UseLazySendMessageOnXMTPParamsType>(hookParams);

  // store it in refs so that is can be used in callbacks/events
  hookParamsRef.current = hookParams;

  const send = useCallback(async (params?: SendMessageParamsType) => {
    setData(null);
    setProgress(null);
    setError(null);

    setLoading(true);

    // create a new abort controller only if the previous one is aborted
    abortControllerRef.current =
      !abortControllerRef.current || abortControllerRef.current?.signal?.aborted
        ? new AbortController()
        : abortControllerRef.current;

    const result = await sendMessageOnXMTP({
      ...hookParamsRef.current,
      ...params,
      abortController: abortControllerRef.current,
      onProgress: (data) => {
        hookParamsRef.current?.onProgress?.(data);
        setProgress(data);
      },
    } as SendMessageOnXMTPParamsType);

    setData(result.data);
    setProgress(result.progress);
    setError(result.error);

    setLoading(false);

    return result;
  }, []);

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const cancel = useCallback(() => {
    abort();
    setLoading(false);  // optimistically stop loading as sendMessageOnXMTP can't be quickly aborted
  }, [abort]);

  // cleanup, call cancel on unmount
  useEffect(() => abort, [abort]);

  return [send, { data, progress, error, loading, cancel }];
}

export function useSendMessageOnXMTP(
  hookParams: UseSendMessageOnXMTPParamsType
): UseSendMessageOnXMTPReturnType {
  const [send, { data, progress, error, loading, cancel }] =
    useLazySendMessageOnXMTP(hookParams);

  useEffect(() => {
    send();
  }, [send]);

  return { data, progress, error, loading, cancel };
}
