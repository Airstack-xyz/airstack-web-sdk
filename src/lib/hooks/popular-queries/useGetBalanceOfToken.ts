import { useQuery } from "../useQuery";

const query = `query GetBalanceOfToken($blockchain: TokenBlockchain!, $tokenAddress: Address!, $owner: Identity) {
  TokenBalance(
    input: {blockchain: $blockchain, tokenAddress: $tokenAddress, owner: $owner}
  ) {
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
}`;

export type GetBalanceOfTokenVariables = {
  blockchain: string;
  tokenAddress: string;
  owner: string;
};

export function useGetBalanceOfToken(variables: GetBalanceOfTokenVariables) {
  return useQuery(query, variables);
}
