import { Signer } from "ethers";
import { WalletClient } from "viem";

export type ProcessedAddress = {
  address: string;
  walletAddress: string;
  isIdentity: boolean;
  isXMTPEnabled: boolean;
};

export type ProgressResult = {
  total: number;
  sent: number;
  error: number;
};

export type MessagingResult = {
  address: string;
  recipientAddress: string;
  sent: boolean;
  error?: unknown;
};

export type WalletType = Signer | WalletClient;

export type SendMessageOnXMTPParamsType = {
  message: string;
  addresses: string[];
  wallet?: WalletType;
  cacheXMTPClient?: boolean;
  abortController?: AbortController;
  onProgress?: (data: ProgressResult) => void;
  onComplete?: (data: MessagingResult[]) => void;
  onError?: (err: unknown) => void;
};

export type SendMessageOnXMTPReturnType = {
  data: MessagingResult[] | null;
  progress: ProgressResult | null;
  error: unknown;
};

export type SendMessageParamsType = Pick<
  SendMessageOnXMTPParamsType,
  "message" | "addresses" | "wallet"
>;

export type UseSendMessageOnXMTPParamsType = Omit<
  SendMessageOnXMTPParamsType,
  "abortController"
>;

export type UseSendMessageOnXMTPReturnType = SendMessageOnXMTPReturnType & {
  loading: boolean;
  cancel: () => void;
};

export type UseLazySendMessageOnXMTPParamsType = Omit<
  SendMessageOnXMTPParamsType,
  "message" | "addresses" | "abortController"
> & {
  message?: string;
  addresses?: string[];
};

export type UseLazySendMessageOnXMTPReturnType = [
  (params?: SendMessageParamsType) => Promise<SendMessageOnXMTPReturnType>,
  UseSendMessageOnXMTPReturnType
];

export type GetXMTPOwnersQueryType = {
  XMTPs: {
    XMTP:
      | {
          isXMTPEnabled: boolean;
          owner: {
            addresses: string[] | null;
            domains:
              | {
                  name: string;
                }[]
              | null;
            socials:
              | {
                  profileName: string;
                  dappName: string;
                }[]
              | null;
          };
        }[]
      | null;
  };
};