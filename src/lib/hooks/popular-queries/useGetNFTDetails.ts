import { useQuery } from "../useQuery";

const query = `query GetNFTDetails($address: Address!, $tokenId: String!, $blockchain: TokenBlockchain!) {
  TokenNft(input: {address: $address, tokenId: $tokenId, blockchain: $blockchain}) {
    token {
      name
      symbol
      decimals
      totalSupply
    }
    metaData {
      name
      description
      image
      attributes {
        trait_type
        value
      }
    }
    tokenURI
    contentValue {
      image {
        extraSmall
        small
        medium
        large
        original
      }
    }
  }
}`;

export type GetNFTDetailsVariables = {
  address: string;
  tokenId: string;
  blockchain: string;
};

export function useGetNFTDetails(variables: GetNFTDetailsVariables) {
  return useQuery(query, variables);
}
