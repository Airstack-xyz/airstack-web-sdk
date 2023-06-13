import { useQuery } from "../useQuery";

const query = `query GetBalance($blockchain: TokenBlockchain!, $tokenAddress: Address!, $owner: Identity) {
  TokenBalance(
    input: {blockchain: $blockchain, tokenAddress: $tokenAddress, owner: $owner}
  ) {
    amount
    formattedAmount
    owner {
      addresses
			isPrimary
      dappName
    }
  }
}`;

export type GetBalanceVariables = {
  blockchain: string;
  tokenAddress: string;
  owner: string;
};

export function useGetBalance(variables: GetBalanceVariables) {
  return useQuery(query, variables);
}
