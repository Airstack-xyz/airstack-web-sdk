import { useLazyQueryWithPagination } from "../useQueryWithPagination";

const query = /* GraphQL */ `
  query GetHoldersOfCollection(
    $tokenAddress: Address
    $blockchain: TokenBlockchain!
    $limit: Int
  ) {
    TokenBalances(
      input: {
        filter: { tokenAddress: { _eq: $tokenAddress } }
        blockchain: $blockchain
        limit: $limit
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

export type GetHoldersOfCollectionOfTokenCollectionVariables = {
  tokenAddress: string[];
  blockchain: string;
  limit: number;
};

export function useGetHoldersOfCollectionOfTokenCollection(
  variables: GetHoldersOfCollectionOfTokenCollectionVariables
) {
  return useLazyQueryWithPagination(query, variables);
}
