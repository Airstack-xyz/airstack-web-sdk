import { useQuery } from "../useQuery";

const query = `query GetImageOfNFT($address: Address!, $tokenId: String!, $blockchain: TokenBlockchain!) {
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

export type GetImageOfNFTVariables = {
  address: string;
  tokenId: string;
  blockchain: string;
};

export function useGetImageOfNFT(variables: GetImageOfNFTVariables) {
  return useQuery(query, variables);
}
