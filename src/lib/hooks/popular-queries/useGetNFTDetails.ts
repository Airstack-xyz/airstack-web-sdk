import { useQuery } from "../useQuery";

const query = /* GraphQL */ `
  query GetNFTDetails(
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
        address
        blockchain
        contentType
        contentValue {
          animation_url {
            original
          }
          image {
            extraSmall
            medium
            large
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
        metaData {
          animationUrl
          backgroundColor
          attributes {
            displayType
            maxValue
            value
            trait_type
          }
          description
          externalUrl
          image
          imageData
          youtubeUrl
          name
        }
        tokenURI
        type
        tokenId
        token {
          baseURI
          address
          blockchain
          contractMetaData {
            description
            image
            name
          }
          decimals
          logo {
            large
            medium
            small
            original
          }
          name
          projectDetails {
            collectionName
            description
            imageUrl
          }
          symbol
          totalSupply
          type
        }
      }
    }
  }
`;

export type GetNFTDetailsVariables = {
  address: string;
  tokenId: string;
  blockchain: string;
};

export function useGetNFTDetails(variables: GetNFTDetailsVariables) {
  return useQuery(query, variables);
}
