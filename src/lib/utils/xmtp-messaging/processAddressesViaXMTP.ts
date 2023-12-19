import { Client } from "@xmtp/xmtp-js";
import { ProcessedAddress } from "../../types/xmtp-messaging";

// Use XMTP API to check if XMTP is enabled for addresses
export async function processAddressesViaXMTP(
  addresses: string[],
  xmtpClient: Client
): Promise<ProcessedAddress[]> {
  const canSendMessages = await xmtpClient.canMessage(addresses);

  const result: ProcessedAddress[] = addresses.map((address, index) => {
    const isIdentity = address.startsWith("0x") ? false : true;
    return {
      address,
      walletAddress: isIdentity ? "" : address.toLowerCase(),
      isIdentity: isIdentity,
      isXMTPEnabled: Boolean(canSendMessages[index]),
    };
  });

  return result;
}
