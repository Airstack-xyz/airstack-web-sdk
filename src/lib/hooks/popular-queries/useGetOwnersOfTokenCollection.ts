import { useLazyQueryWithPagination } from "../useQueryWithPagination";

const query = `query GetOwners($tokenAddress: Address, $blockchain: TokenBlockchain!, $limit: Int) {
  TokenBalances(
    input: {filter: {tokenAddress: {_eq: $tokenAddress}}, blockchain: $blockchain, limit: $limit}
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

export type GetOwnersOfTokenCollectionVariables = {
  tokenAddress: string[];
  blockchain: string;
  limit: number;
};

export function useGetOwnersOfTokenCollection(
  variables: GetOwnersOfTokenCollectionVariables
) {
  return useLazyQueryWithPagination(query, variables);
}
