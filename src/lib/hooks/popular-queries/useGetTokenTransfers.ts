import { useQuery } from "../useQuery";

const query = `query GetTokenTransfers($tokenAddress: Address, $blockchain: TokenBlockchain!, $limit: Int) {
    TokenTransfers(
      input: {filter: { tokenAddress: {_eq: $tokenAddress}}, blockchain: $blockchain, limit: $limit}
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

export type GetTokenTransfersVariables = {
  address: string;
  blockchain: string;
};

export function useGetTokenTransfers(variables: GetTokenTransfersVariables) {
  return useQuery(query, variables);
}
