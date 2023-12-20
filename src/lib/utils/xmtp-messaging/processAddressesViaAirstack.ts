import { fetchQuery } from "../../apis";
import {
  GetXmtpOwnersQuery,
  ProcessedAddress,
} from "../../types/xmtp-messaging";

const GetXmtpOwners = `query GetXmtpOwners($owners: [Identity!]) {
    XMTPs(input: {blockchain: ALL, filter: {owner: {_in: $owners}}, limit: 100}) {
      XMTP {
        isXMTPEnabled
        owner {
          addresses
          domains(input: {limit: 100}) {
            name
          }
          socials(input: {limit: 100}) {
            profileName
            dappName
          }
        }
      }
    }
  }`;

// Use Airstack API to process addresses:
// 1. Resolve identity to address
// 2. Check if XMTP is enabled for address
export async function processAddressesViaAirstack(
  addresses: string[],
  abortController?: AbortController
): Promise<ProcessedAddress[]> {
  // used for storing map for xmtp enabled identity/address -> wallet address
  const identityToAddressMap = new Map<string, string>();

  const { data, error } = await fetchQuery<GetXmtpOwnersQuery>(
    GetXmtpOwners,
    {
      owners: addresses,
    },
    {
      abortController,
    }
  );

  // if request was aborted then simply return empty data
  if (abortController?.signal?.aborted) {
    return [];
  }

  // if error occurred while calling query then throw error
  if (error) {
    throw new Error("Error ocurred in GetXmtpOwnersQuery ", error);
  }

  const XMTPList = data?.XMTPs?.XMTP || [];

  XMTPList.forEach((xmtp) => {
    const isXMTPEnabled = xmtp?.isXMTPEnabled;
    const walletAddress = xmtp?.owner?.addresses?.[0];

    if (isXMTPEnabled && walletAddress) {
      const domains = xmtp?.owner?.domains || [];
      const socials = xmtp?.owner?.socials || [];
      const addresses = xmtp?.owner?.addresses || [];

      domains.forEach((domain) => {
        identityToAddressMap.set(domain.name, walletAddress);
      });
      socials.forEach((social) => {
        identityToAddressMap.set(social.profileName, walletAddress);
        // put mapping for lens v1 profile name also
        if (
          social.dappName === "lens" &&
          social.profileName.startsWith("lens/@")
        ) {
          const lensV1ProfileName = `${social.profileName.substring(6)}.lens`;
          identityToAddressMap.set(lensV1ProfileName, walletAddress);
        }
      });
      // store addresses in map also, it gives info about address having XMTP enabled
      addresses.forEach((address) => {
        identityToAddressMap.set(address, address);
      });
    }
  });

  const result: ProcessedAddress[] = addresses.map((address) => {
    const isIdentity = address.startsWith("0x") ? false : true;
    return {
      address,
      walletAddress: isIdentity
        ? identityToAddressMap.get(address) || ""
        : address.toLowerCase(),
      isIdentity: isIdentity,
      isXMTPEnabled: identityToAddressMap.has(address),
    };
  });

  return result;
}
