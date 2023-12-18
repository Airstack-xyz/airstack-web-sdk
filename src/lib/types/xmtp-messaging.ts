import { Signer } from "ethers";
import { WalletClient } from "viem";

export type ProgressData = {
  total: number;
  sent: number;
  error: number;
};

export type SendMessageOnXmtpParamsType = {
  message: string;
  addresses: string[];
  wallet?: Signer | WalletClient | null;
  onProgress?: (data: ProgressData) => void;
  onComplete?: (data: boolean[]) => void;
  onError?: (err: unknown) => boolean | void;
};

export type SendMessageOnXmtpReturnType = Promise<{
  data: boolean[];
  error: unknown;
  progress: ProgressData;
}>;
