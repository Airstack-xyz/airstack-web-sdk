import { Chain } from "../constants";
import { type } from "../types";
import { fetchGql } from "../utils/fetcher";

const query = `query GetTokenNfts($address: Address, $tokenId: String, $blockchain: TokenBlockchain!) {
    TokenNfts(input: {filter: {address: {_eq: $address}, tokenId: {_eq: $tokenId}}, blockchain: $blockchain}) {
      TokenNft {
        tokenId
        contentType
        contentValue {
          video {
            original
          }
          audio {
            original
          }
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
        }
      }
    }
  }
`;

export function getNftContent(
  chainId: Chain,
  address: string,
  tokenId: string
) {
  return fetchGql<type>(query, {
    blockchain: chainId,
    address,
    tokenId,
  });
}
