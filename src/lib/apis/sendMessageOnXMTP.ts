import { XMTP_ADDRESS_BATCH_SIZE } from "../constants/xmtp-messaging";
import {
  MessagingResult,
  ProgressResult,
  SendMessageOnXMTPParamsType,
  SendMessageOnXMTPReturnType
} from "../types/xmtp-messaging";
import { getProcessedAddresses, getXMTPClient } from "../utils/xmtp-messaging";

export async function sendMessageOnXMTP({
  message,
  addresses,
  wallet,
  cacheXMTPClient,
  abortController,
  onProgress,
  onComplete,
  onError,
}: SendMessageOnXMTPParamsType): Promise<SendMessageOnXMTPReturnType> {
  const resultToReturn: {
    data: MessagingResult[];
    progress: ProgressResult;
    error: unknown;
  } = {
    data: [],
    progress: { total: addresses.length, sent: 0, error: 0 },
    error: null,
  };

  if (abortController?.signal?.aborted) {
    return resultToReturn;
  }

  try {
    const client = await getXMTPClient(wallet, cacheXMTPClient);

    if (abortController?.signal?.aborted) {
      return resultToReturn;
    }

    // trigger progress event before starting
    onProgress?.(resultToReturn.progress);

    for (
      let currentBatchIndex = 0;
      currentBatchIndex < addresses.length;
      currentBatchIndex += XMTP_ADDRESS_BATCH_SIZE
    ) {
      if (abortController?.signal?.aborted) {
        return resultToReturn;
      }

      // split addresses into batches to be processed in parallel
      const currentBatch = addresses.slice(
        currentBatchIndex,
        currentBatchIndex + XMTP_ADDRESS_BATCH_SIZE
      );

      // process addresses using Airstack's XMTPs api:
      // 1. resolve identity to address
      // 2. check if XMTP is enabled for address
      const processedBatch = await getProcessedAddresses(
        currentBatch,
        abortController
      );

      if (abortController?.signal?.aborted) {
        return resultToReturn;
      }

      const promises = processedBatch.map(async (item) => {
        if (abortController?.signal?.aborted) {
          throw new Error(`Messaging to address ${item.address} is aborted`);
        }
        if (!item.isXMTPEnabled) {
          throw new Error(
            `Recipient ${item.address} is not on the XMTP network`
          );
        }
        if (item.isIdentity && !item.walletAddress) {
          throw new Error(
            `Identity ${item.address} couldn't be resolved to address`
          );
        }
        const conversation = await client.conversations.newConversation(
          item.walletAddress
        );
        return conversation.send(message);
      });

      const settledPromises = await Promise.allSettled(promises);

      if (abortController?.signal?.aborted) {
        return resultToReturn;
      }

      settledPromises.forEach((item, itemIndex) => {
        const dataIndex = currentBatchIndex + itemIndex;
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
        }
      });

      if (abortController?.signal?.aborted) {
        return resultToReturn;
      }

      // trigger progress event for batch
      onProgress?.(resultToReturn.progress);
    }
  } catch (err) {
    onError?.(err);
    return { data: null, progress: null, error: err };
  }

  if (abortController?.signal?.aborted) {
    return resultToReturn;
  }

  onComplete?.(resultToReturn.data);

  return resultToReturn;
}
