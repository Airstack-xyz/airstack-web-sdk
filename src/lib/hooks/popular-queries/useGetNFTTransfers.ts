import { useLazyQueryWithPagination } from "../useQueryWithPagination";

const query = /* GraphQL */ `
  query GetNFTTransfers(
    $tokenAddress: Address
    $tokenId: String
    $blockchain: TokenBlockchain!
    $limit: Int
  ) {
    TokenTransfers(
      input: {
        filter: {
          tokenId: { _eq: $tokenId }
          tokenAddress: { _eq: $tokenAddress }
        }
        blockchain: $blockchain
        limit: $limit
      }
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
  }
`;

export type GetNFTTransfersVariables = {
  tokenAddress: string;
  tokenId: string;
  blockchain: string;
  limit: number;
};

export function useGetNFTTransfers(variables: GetNFTTransfersVariables) {
  return useLazyQueryWithPagination(query, variables);
}
