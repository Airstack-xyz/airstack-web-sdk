import { useCallback, useEffect, useRef, useState } from "react";
import { sendMessageOnXMTP } from "../apis";
import {
  MessagingResult,
  ProgressResult,
  SendMessageOnXmtpParamsType,
  SendMessageParamsType,
  UseLazySendMessageOnXMTPHookParamsType,
  UseLazySendMessageOnXMTPHookReturnType,
  UseSendMessageOnXMTPHookParamsType,
  UseSendMessageOnXMTPHookReturnType,
} from "../types/xmtp-messaging";

export function useLazySendMessageOnXMTP(
  hookParams: UseLazySendMessageOnXMTPHookParamsType
): UseLazySendMessageOnXMTPHookReturnType {
  const [data, setData] = useState<MessagingResult[] | null>(null);
  const [progress, setProgress] = useState<ProgressResult | null>(null);
  const [error, setError] = useState<unknown>(null);

  const [loading, setLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const hookParamsRef =
    useRef<UseLazySendMessageOnXMTPHookParamsType>(hookParams);

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

    // if aborted then do not update data and error
    if (!abortControllerRef.current?.signal?.aborted) {
        setError(result.error);
        setData(result.data);
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

export function useSendMessageOnXMTP(
  hookParams: UseSendMessageOnXMTPHookParamsType
): UseSendMessageOnXMTPHookReturnType {
  const [send, { data, progress, error, loading, cancel }] =
    useLazySendMessageOnXMTP(hookParams);

  useEffect(() => {
    send();
    return () => cancel();
  }, [cancel, send]);

  return { data, progress, error, loading, cancel };
}
