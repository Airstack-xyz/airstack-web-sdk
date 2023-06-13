import { useQuery } from "../useQuery";

const query = `query GetENSName($identity: Identity!, $blockchain: TokenBlockchain!) {
  Wallet(input: {identity: $identity, blockchain: $blockchain}) {
    primaryDomain {
      name
      dappName
    }
  }
}`;

export type GetENSNameVariables = {
  identity: string;
  blockchain: string;
};

export function useGetENSName(variables: GetENSNameVariables) {
  return useQuery(query, variables);
}
