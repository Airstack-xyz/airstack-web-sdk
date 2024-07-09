import { useLazyQueryWithPagination } from "../useQueryWithPagination";

const query = /* GraphQL */ `
  query GetHoldersOfNFT(
    $tokenAddress: Address
    $tokenId: String
    $blockchain: TokenBlockchain!
  ) {
    TokenBalances(
      input: {
        filter: {
          tokenAddress: { _eq: $tokenAddress }
          tokenId: { _eq: $tokenId }
        }
        blockchain: $blockchain
      }
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
            image {
              extraSmall
              large
              medium
              original
              small
            }
            video {
              original
            }
            audio {
              original
            }
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
  }
`;

export type GetHoldersOfNFTVariables = {
  tokenAddress: string;
  tokenId: string;
  blockchain: string;
};

export function useGetHoldersOfNFT(variables: GetHoldersOfNFTVariables) {
  return useLazyQueryWithPagination(query, variables);
}
