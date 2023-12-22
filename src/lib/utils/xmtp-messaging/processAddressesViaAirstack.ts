import { fetchQuery } from "../../apis";
import {
  GetXMTPOwnersQueryType,
  ProcessedAddress,
} from "../../types/xmtp-messaging";

const GetXMTPOwnersQuery = `query GetXMTPOwners($owners: [Identity!]) {
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

// use Airstack's XMTPs api to process addresses:
// 1. resolve identity to address
// 2. check if XMTP is enabled for address
export async function processAddressesViaAirstack(
  addresses: string[],
  abortController?: AbortController
): Promise<ProcessedAddress[]> {
  // used for storing map for xmtp enabled identity/address -> wallet address
  const identityToAddressMap = new Map<string, string>();

  // convert addresses to lowercase to avoid mismatch from api response
  const normalizedAddresses = addresses.map((address) =>
    address.trim().toLowerCase()
  );

  const { data, error } = await fetchQuery<GetXMTPOwnersQueryType>(
    GetXMTPOwnersQuery,
    {
      owners: normalizedAddresses,
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
    throw new Error(`Couldn't fetch GetXMTPOwners - ${error?.[0]?.message}`);
  }

  const xmtpList = data?.XMTPs?.XMTP || [];

  xmtpList.forEach((item) => {
    const isXMTPEnabled = item?.isXMTPEnabled;
    const walletAddress = item?.owner?.addresses?.[0];

    if (isXMTPEnabled && walletAddress) {
      const ownerDomains = item?.owner?.domains || [];
      const ownerSocials = item?.owner?.socials || [];
      const ownerAddresses = item?.owner?.addresses || [];

      ownerDomains.forEach((domain) => {
        // store ens identity (name.eth) in map
        identityToAddressMap.set(domain.name, walletAddress);
      });
      ownerSocials.forEach((social) => {
        const profileName = social?.profileName || "";
        const dappName = social?.dappName || "";

        switch (dappName) {
          case "lens":
            {
              // store lens v2 identity (lens/@name) in map
              const lensV2Identity = profileName;
              identityToAddressMap.set(lensV2Identity, walletAddress);
              // store lens v1 identity (name.lens) in map
              if (profileName.startsWith("lens/@")) {
                const lensV1Identity = `${profileName.substring(6)}.lens`;
                identityToAddressMap.set(lensV1Identity, walletAddress);
              }
            }
            break;
          case "farcaster":
            {
              // store farcaster identity (fc_fname:name) in map
              const farcasterIdentity = `fc_fname:${profileName}`;
              identityToAddressMap.set(farcasterIdentity, walletAddress);
            }
            break;
          default:
            identityToAddressMap.set(profileName, walletAddress);
        }
      });
      // store owner addresses in map also, it gives info about address having XMTP enabled
      ownerAddresses.forEach((address) => {
        identityToAddressMap.set(address, address);
      });
    }
  });

  const result: ProcessedAddress[] = normalizedAddresses.map((address) => {
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
