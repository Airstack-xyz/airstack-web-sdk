import { Client } from "@xmtp/xmtp-js";
import { ProcessedAddress } from "../../types/xmtp-messaging";

// Use XMTP API to check if XMTP is enabled for addresses
export async function processAddressesViaXMTP(
  addresses: string[],
  xmtpClient: Client
): Promise<ProcessedAddress[]> {
  // used for storing map for address -> xmtp enabled status
  const addressToCanSendMap = new Map<string, boolean>();

  const filteredAddresses = addresses
    .filter((address) => address.startsWith("0x"))
    .map((address) => address.toLowerCase());

  const canSendMessages = await xmtpClient.canMessage(filteredAddresses);

  canSendMessages.forEach((canSend, index) => {
    addressToCanSendMap.set(filteredAddresses[index], canSend);
  });

  const result: ProcessedAddress[] = addresses.map((address) => {
    const isIdentity = address.startsWith("0x") ? false : true;
    return {
      address,
      walletAddress: isIdentity ? "" : address.toLowerCase(),
      isIdentity: isIdentity,
      isXMTPEnabled: Boolean(addressToCanSendMap.get(address)),
    };
  });

  return result;
}
