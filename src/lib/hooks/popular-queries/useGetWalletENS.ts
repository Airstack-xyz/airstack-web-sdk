import { useQuery } from "../useQuery";

const query = `query GetWalletENS($identity: Identity!, $blockchain: TokenBlockchain!) {
  Wallet(input: {identity: $identity, blockchain: $blockchain}) {
    primaryDomain {
      name
      dappName
    }
    domains {
      name
      owner
      parent
      subDomainCount
      subDomains {
        name
        owner
        parent
      }
      tokenId
      blockchain
      dappName
      resolvedAddress
      isPrimary
      expiryTimestamp
    }
  }
}`;

export type GetWalletENSVariables = {
  identity: string;
  blockchain: string;
};

export function useGetWalletENS(variables: GetWalletENSVariables) {
  return useQuery(query, variables);
}
