import { useLazyQueryWithPagination } from "../useQueryWithPagination";

const query = `query GetAllNFTs($blockchain: TokenBlockchain!, $limit: Int, $nftAddress: Address) {
  TokenNfts(
    input: {blockchain: $blockchain, limit: $limit, filter: {address: {_eq: $nftAddress}}}
  ) {
    TokenNft {
      blockchain
      chainId
      type
      totalSupply
      tokenURI
    }
    pageInfo {
      nextCursor
      prevCursor
    }
  }
}`;

export type GetAllNFTsVariables = {
  blockchain: string;
  limit: number;
  nftAddress: string;
};

export function useGetAllNFTs(variables: GetAllNFTsVariables) {
  return useLazyQueryWithPagination(query, variables);
}
