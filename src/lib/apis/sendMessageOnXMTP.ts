import { Client } from "@xmtp/xmtp-js";
import { Eip1193Provider, ethers } from "ethers";
import {
  MessagingResult,
  ProgressResult,
  SendMessageOnXmtpParamsType,
  SendMessageOnXmtpReturnType,
} from "../types/xmtp-messaging";
import { XMTP_ADDRESS_BATCH_SIZE } from "../constants/xmtp-messaging";
import {
  processAddressesViaXMTP,
  processAddressesViaAirstack,
} from "../utils/xmtp-messaging";

export async function sendMessageOnXMTP({
  message,
  addresses,
  wallet,
  processAddressesViaAirstackAPIs,
  abortController,
  onProgress,
  onComplete,
  onError,
}: SendMessageOnXmtpParamsType): Promise<SendMessageOnXmtpReturnType> {
  const resultToReturn: {
    data: MessagingResult[];
    progress: ProgressResult;
    error: unknown;
  } = {
    data: [],
    progress: { total: addresses.length, sent: 0, error: 0 },
    error: null,
  };

  let signer = wallet;

  if (abortController?.signal?.aborted) {
    return resultToReturn;
  }

  try {
    if (!signer) {
      if (!("ethereum" in window)) {
        throw new Error("Browser based wallet not found");
      }
      const provider = new ethers.BrowserProvider(
        window.ethereum as Eip1193Provider
      );
      signer = await provider.getSigner();
    }

    const xmtpClient = await Client.create(signer, { env: "dev" });

    if (abortController?.signal?.aborted) {
      return resultToReturn;
    }

    // trigger progress event before starting
    onProgress?.(resultToReturn.progress);

    for (
      let batchIndex = 0;
      batchIndex < addresses.length;
      batchIndex += XMTP_ADDRESS_BATCH_SIZE
    ) {
      if (abortController?.signal?.aborted) {
        return resultToReturn;
      }

      // split addresses into batches to be processed in parallel
      // see: https://xmtp.org/docs/faq#rate-limiting for rate limiting info
      const addressesBatch = addresses.slice(
        batchIndex,
        batchIndex + XMTP_ADDRESS_BATCH_SIZE
      );
      // process addresses using airstack or xmtp apis based on flag
      // processing via airstack also resolves identities
      const processedBatch = processAddressesViaAirstackAPIs
        ? await processAddressesViaAirstack(addressesBatch, abortController)
        : await processAddressesViaXMTP(addressesBatch, xmtpClient);
      
      if (abortController?.signal?.aborted) {
        return resultToReturn;
      }

      const promisesBatch = processedBatch.map(async (item) => {
        if (abortController?.signal?.aborted) {
          throw new Error(
            `Messaging to address ${item.address} is aborted`
          );
        }
        if (item.isIdentity && !item.walletAddress) {
          if (!processAddressesViaAirstackAPIs) {
            throw new Error(
              `Address ${item.address} is not valid`
            );
          }
          throw new Error(
            `Identity ${item.address} couldn't be resolved to address`
          );
        }
        if (!item.isXMTPEnabled) {
          throw new Error(
            `Recipient ${item.address} is not on the XMTP network`
          );
        }
        const conversation = await xmtpClient.conversations.newConversation(
          item.walletAddress
        );
        return conversation.send(message);
      });

      const resultsBatch = await Promise.allSettled(promisesBatch);

      if (abortController?.signal?.aborted) {
        return resultToReturn;
      }

      resultsBatch.forEach((item, itemIndex) => {
        const dataIndex = batchIndex + itemIndex;
        if (item.status === "fulfilled") {
          resultToReturn.progress.sent += 1;
          resultToReturn.data[dataIndex] = {
            address: processedBatch[itemIndex].address,
            recipientAddress: processedBatch[itemIndex].walletAddress,
            sent: true,
          };
        } else {
          resultToReturn.progress.error += 1;
          resultToReturn.data[dataIndex] = {
            address: processedBatch[itemIndex].address,
            recipientAddress: processedBatch[itemIndex].walletAddress,
            sent: false,
            error: item.reason,
          };
          // if onError exist then based on its return value halt further processing
          if (onError) {
            const shouldHalt = onError(item.reason);
            if (shouldHalt) {
              resultToReturn.error = item.reason;
              return resultToReturn;
            }
          }
        }
      });

      if (abortController?.signal?.aborted) {
        return resultToReturn;
      }

      // trigger progress event for batch results
      onProgress?.(resultToReturn.progress);
    }
  } 
  // catching fatal errors i.e. errors which prevents messaging
  catch (err) {
    onError?.(err);
    return { data: null, progress: null, error: err };
  }

  if (abortController?.signal?.aborted) {
    return resultToReturn;
  }

  onComplete?.(resultToReturn.data);

  return resultToReturn;
}
