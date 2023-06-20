import { useLazyQueryWithPagination } from "../useQueryWithPagination";

const query = `query GetAllTransfersOfTokenNFT($tokenAddress: Address, $tokenId: String, $blockchain: TokenBlockchain!, $limit: Int) {
  TokenTransfers(
    input: {filter: {tokenId: {_eq: $tokenId}, tokenAddress: {_eq: $tokenAddress}}, blockchain: $blockchain, limit: $limit}
  ) {
    TokenTransfer {
      amount
      blockNumber
      blockTimestamp
      from {
        addresses
      }
      to {
        addresses
      }
      tokenAddress
      transactionHash
      tokenId
      tokenType
      blockchain
    }
    pageInfo {
      nextCursor
      prevCursor
    }
  }
}`;

export type GetAllTransfersOfTokenVariables = {
  tokenAddress: string;
  tokenId: string;
  blockchain: string;
  limit: number;
};

export function useGetAllTransfersOfToken(
  variables: GetAllTransfersOfTokenVariables
) {
  return useLazyQueryWithPagination(query, variables);
}
