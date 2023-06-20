import { useQuery } from "../useQuery";

const query = `query GetSocialProfileAndENS($identity: Identity!, $blockchain: TokenBlockchain!) {
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

export type GetSocialProfileAndENSVariables = {
  identity: string;
  blockchain: string;
};

export function useGetSocialProfileAndENS(
  variables: GetSocialProfileAndENSVariables
) {
  return useQuery(query, variables);
}
