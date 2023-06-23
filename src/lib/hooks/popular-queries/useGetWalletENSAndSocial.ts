import { useQuery } from "../useQuery";

const query = `query GetWalletENSAndSocial($identity: Identity!, $blockchain: TokenBlockchain!) {
  Wallet(input: {identity: $identity, blockchain: $blockchain}) {
    domains {
      dappName
      owner
      isPrimary
    }
    socials {
      dappName
      profileName
      profileTokenAddress
      profileTokenId
      userId
      chainId
      blockchain
    }
  }
}`;

export type GetWalletENSAndSocialVariables = {
  identity: string;
  blockchain: string;
};

export function useGetWalletENSAndSocial(
  variables: GetWalletENSAndSocialVariables
) {
  return useQuery(query, variables);
}
