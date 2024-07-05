import { useQuery } from "../useQuery";

const query = /* GraphQL */ `
  query GetBalanceOfToken(
    $blockchain: TokenBlockchain!
    $tokenAddress: Address!
    $owner: Identity
  ) {
    TokenBalances(
      input: {
        blockchain: $blockchain
        filter: { tokenAddress: { _eq: $tokenAddress }, owner: { _eq: $owner } }
      }
    ) {
      TokenBalance {
        amount
        formattedAmount
        tokenType
        tokenId
        token {
          name
          symbol
          decimals
          totalSupply
        }
        tokenNfts {
          contentType
          contentValue {
            image {
              extraSmall
              large
              medium
              original
              small
            }
            animation_url {
              original
            }
            video {
              original
            }
            audio {
              original
            }
          }
          metaData {
            animationUrl
            attributes {
              displayType
              maxValue
              trait_type
              value
            }
            backgroundColor
            description
            externalUrl
            image
            imageData
            name
            youtubeUrl
          }
          tokenURI
          tokenId
        }
      }
    }
  }
`;

export type GetBalanceOfTokenVariables = {
  blockchain: string;
  tokenAddress: string;
  owner: string;
};

export function useGetBalanceOfToken(variables: GetBalanceOfTokenVariables) {
  return useQuery(query, variables);
}
