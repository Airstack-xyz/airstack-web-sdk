import { useLazyQueryWithPagination } from "../useQueryWithPagination";

const query = `query GetOwnerOfNFT($nftAddress: String, $blockchain: TokenBlockchain!) {
  TokenNfts(input: {filter: {tokenId: {_eq: $nftAddress}}, blockchain: $blockchain}) {
    TokenNft {
      tokenId
      tokenBalances {
        owner {
          identity
          addresses
        }
      }
    }
    pageInfo {
      nextCursor
      prevCursor
    }
  }
}`;

export type GetOwnerOfNFTVariables = {
  nftAddress: string;
  blockchain: string;
};

export function useGetOwnerOfNFT(variables: GetOwnerOfNFTVariables) {
  return useLazyQueryWithPagination(query, variables);
}
