import { useQuery } from "../useQuery";

const query = `query GetNFTImages($address: Address!, $tokenId: String!, $blockchain: TokenBlockchain!) {
  TokenNft(input: {address: $address, tokenId: $tokenId, blockchain: $blockchain}) {
    contentValue {
      image {
        original
        extraSmall
        large
        medium
        small
      }
    }
  }
}`;

export type GetNFTImagesVariables = {
  address: string;
  tokenId: string;
  blockchain: string;
};

export function useGetNFTImages(variables: GetNFTImagesVariables) {
  return useQuery(query, variables);
}
