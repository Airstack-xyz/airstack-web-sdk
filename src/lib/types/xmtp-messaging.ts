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

export type SendMessageOnXmtpParamsType = {
  message: string;
  addresses: string[];
  processAddressesViaAirstackAPIs?: boolean;
  wallet?: Signer | WalletClient | null;
  onProgress?: (data: ProgressResult) => void;
  onComplete?: (data: MessagingResult[]) => void;
  onError?: (err: unknown) => boolean | void;
};

export type SendMessageOnXmtpReturnType = {
  data: MessagingResult[] | null;
  progress: ProgressResult | null;
  error: unknown;
};

export type SendMessageParamsType = Pick<SendMessageOnXmtpParamsType, "message"| "addresses">;

export type UseMessagingOnXmtpHookParamsType = SendMessageOnXmtpParamsType;

export type UseMessagingOnXmtpHookReturnType = SendMessageOnXmtpReturnType & {
  loading: boolean;
};

export type UseLazyMessagingOnXmtpHookParamsType = Omit<SendMessageOnXmtpParamsType, "message"| "addresses"> & {
  message?: string;
  addresses?: string[];
};

export type UseLazyMessagingOnXmtpHookReturnType = [
  (sendParams?: SendMessageParamsType) => Promise<SendMessageOnXmtpReturnType>,
  UseMessagingOnXmtpHookReturnType
];

export type GetXmtpOwnersQuery = {
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

export type GetXmtpOwnersQueryVariables = {
  owners: string[];
};
