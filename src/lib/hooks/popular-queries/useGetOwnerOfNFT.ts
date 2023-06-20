import { useLazyQueryWithPagination } from "../useQueryWithPagination";

const query = `query GetOwners($tokenAddress: Address, $tokenId: String, $blockchain: TokenBlockchain!) {
  TokenBalances(
    input: {filter: {tokenAddress: {_eq: $tokenAddress}, tokenId: {_eq: $tokenId}}, blockchain: $blockchain}
  ) {
    TokenBalance {
      token {
        name
        symbol
        decimals
      }
      tokenId
      tokenType
      tokenNfts {
        contentType
        contentValue {
          animation_url {
            original
          }
          audio
          image {
            extraSmall
            large
            medium
            original
            small
          }
          video
        }
      }
      owner {
        addresses
        primaryDomain {
          name
          resolvedAddress
        }
        domains {
          name
          owner
        }
        socials {
          dappName
          profileName
          userAddress
          userAssociatedAddresses
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
  tokenAddress: string;
  tokenId: string;
  blockchain: string;
};

export function useGetOwnerOfNFT(variables: GetOwnerOfNFTVariables) {
  return useLazyQueryWithPagination(query, variables);
}
