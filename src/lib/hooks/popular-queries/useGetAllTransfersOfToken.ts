import { useLazyQueryWithPagination } from "../useQueryWithPagination";

const query = `query GetAllTransfersOfToken($tokenAddress: String, $blockchain: TokenBlockchain!, $limit: Int) {
  ethereumTransfers: TokenTransfers(
    input: {filter: {tokenId: {_eq: $tokenAddress}}, blockchain: $blockchain, limit: $limit}
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
  polygonTransfers: TokenTransfers(
    input: {filter: {tokenId: {_eq: $tokenAddress}}, blockchain: $blockchain, limit: $limit}
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
  blockchain: string;
  limit: number;
};

export function useGetAllTransfersOfToken(
  variables: GetAllTransfersOfTokenVariables
) {
  return useLazyQueryWithPagination(query, variables);
}
