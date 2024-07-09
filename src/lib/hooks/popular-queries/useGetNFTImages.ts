import { useQuery } from "../useQuery";

const query = /* GraphQL */ `
  query GetNFTImages(
    $address: Address!
    $tokenId: String!
    $blockchain: TokenBlockchain!
  ) {
    TokenNfts(
      input: {
        filter: { address: { _eq: $address }, tokenId: { _eq: $tokenId } }
        blockchain: $blockchain
      }
    ) {
      TokenNft {
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
    }
  }
`;

export type GetNFTImagesVariables = {
  address: string;
  tokenId: string;
  blockchain: string;
};

export function useGetNFTImages(variables: GetNFTImagesVariables) {
  return useQuery(query, variables);
}
