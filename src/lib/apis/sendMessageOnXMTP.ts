import { Client } from "@xmtp/xmtp-js";
import { Eip1193Provider, ethers } from "ethers";
import {
  SendMessageOnXmtpParamsType,
  SendMessageOnXmtpReturnType,
} from "../types/xmtp-messaging";

// see: https://xmtp.org/docs/faq#rate-limiting for rate limiting info
const MAX_ADDRESS_PER_BATCH = 50;

export async function sendMessageOnXMTP({
  message,
  addresses,
  wallet,
  onProgress,
  onComplete,
  onError,
}: SendMessageOnXmtpParamsType): SendMessageOnXmtpReturnType {
  const resultToReturn: Awaited<SendMessageOnXmtpReturnType> = {
    data: [],
    error: null,
    progress: { total: addresses.length, sent: 0, error: 0 },
  };

  let signer = wallet;

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

    const xmtp = await Client.create(signer, { env: "dev" });

    for (let i = 0; i < addresses.length; i += MAX_ADDRESS_PER_BATCH) {
      // split addresses into batches to be processed in parallel
      const addressesBatch = addresses.slice(i, i + MAX_ADDRESS_PER_BATCH);
      // check presence of addresses on XMTP network
      const canSendMessages = await xmtp.canMessage(addressesBatch);
      
      const promisesBatch = addressesBatch.map(async (address, index) => {
        if (canSendMessages[index]) {
          const conversation = await xmtp.conversations.newConversation(
            address
          );
          await conversation.send(message);
        } else {
          throw new Error(`${address} is not present on XMTP network`);
        }
      });

      const results = await Promise.allSettled(promisesBatch);

      for (let j = 0; j < results.length; j += 1) {
        const result = results[j];
        // increase progress stats based on settled promise's status
        if (result.status === "fulfilled") {
          resultToReturn.progress.sent += 1;
          resultToReturn.data[i + j] = true;
        } else {
          resultToReturn.progress.error += 1;
          resultToReturn.data[i + j] = false;
          // if onError exist -> based on its return value halt further processing
          if (onError) {
            const shouldHalt = onError(result.reason);
            if (shouldHalt) {
              resultToReturn.error = result.reason;
              return resultToReturn;
            }
          }
        }
      }

      onProgress?.(resultToReturn.progress);
    }
  } catch (err) {
    resultToReturn.error = err;
    onError?.(resultToReturn.error);
    return resultToReturn;
  }

  onComplete?.(resultToReturn.data);

  return resultToReturn;
}
