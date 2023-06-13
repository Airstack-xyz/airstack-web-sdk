import { useLazyQueryWithPagination } from "../useQueryWithPagination";

const query = `query GetAllTokensByWalletAddress($ownerAddress: Identity, $tokenTypes: [TokenType!], $blockchain: TokenBlockchain!, $limit: Int) {
    TokenBalances(
      input: {filter: {owner: {_eq: $ownerAddress}, tokenType: {_in: $tokenTypes}}, blockchain: $blockchain, limit: $limit}
    ) {
      TokenBalance {
        tokenAddress
        amount
        formattedAmount
        tokenType
        token {
          name
          symbol
        }
      }
      pageInfo {
        nextCursor
        prevCursor
      }
    }
  }`;

export type GetTokenByWalletAddressVariables = {
  ownerAddress: string;
  tokenTypes: string[];
  blockchain: string;
  limit: number;
};

export function useGetTokenByWalletAddress(
  variables: GetTokenByWalletAddressVariables
) {
  return useLazyQueryWithPagination(query, variables);
}
