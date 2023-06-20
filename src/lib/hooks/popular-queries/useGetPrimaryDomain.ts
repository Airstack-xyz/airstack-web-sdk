import { useQuery } from "../useQuery";

const query = `query GetPrimaryDomain($identity: Identity!, $blockchain: TokenBlockchain!) {
  Wallet(input: {identity: $identity, blockchain: $blockchain}) {
    primaryDomain {
      name
      dappName
      tokenId
      chainId
      blockchain
      labelName
      labelHash
      owner
      parent
    }
  }
}`;

export type GetPrimaryDomainVariables = {
  identity: string;
  blockchain: string;
};

export function useGetPrimaryDomain(variables: GetPrimaryDomainVariables) {
  return useQuery(query, variables);
}
