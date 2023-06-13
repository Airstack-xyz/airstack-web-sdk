import { useQuery } from "../useQuery";

const query = `query TokenDetails($tokenAddress: Address!, $blockchain: TokenBlockchain!) {
  Token(input: {address: $tokenAddress, blockchain: $blockchain}) {
    name
    symbol
    decimals
    totalSupply
  }
}`;

export type GetTokenDetailsVariables = {
  tokenAddress: string;
  blockchain: string;
};

export function useGetTokenDetails(variables: GetTokenDetailsVariables) {
  return useQuery(query, variables);
}
