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
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<ProgressResult | null>(null);
  const [error, setError] = useState<unknown>(null);

  const hookParamsRef =
    useRef<UseLazyMessagingOnXmtpHookParamsType>(hookParams);

  // store it in refs so that is can be used in callbacks/events
  hookParamsRef.current = hookParams;

  const sendMessage = useCallback(
    async (params?: SendMessageParamsType) => {
      setLoading(true);

      const result = await sendMessageOnXMTP({
        ...hookParamsRef.current,
        ...params,
        onProgress: (data) => {
          hookParamsRef.current?.onProgress?.(data);
          setProgress(data);
        },
      } as SendMessageOnXmtpParamsType);

      if (result.error) setError(result.error);
      if (result.data) setData(result.data);

      setLoading(false);

      return result;
    },
    []
  );

  return [sendMessage, { data, loading, progress, error }];
}

export function useMessagingOnXMTP(
  hookParams: UseMessagingOnXmtpHookParamsType
): UseMessagingOnXmtpHookReturnType {
  const [sendMessage, { data, loading, progress, error }] =
    useLazyMessagingOnXMTP(hookParams);

  useEffect(() => {
    sendMessage();
  }, [sendMessage]);

  return { data, loading, progress, error };
}
