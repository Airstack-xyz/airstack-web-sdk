import { Chain } from "../../constants";
import { fetchGql } from "../../fetcher";

const query = `query GetTokenNfts($address: Address, $tokenId: String, $blockchain: TokenBlockchain!) {
    TokenNfts(input: {filter: {address: {_eq: $address}, tokenId: {_eq: $tokenId}}, blockchain: $blockchain}) {
      TokenNft {
        tokenId
        contentType
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
    }
  }
`;

interface GetTokenNftsQueryData {
  TokenNfts: {
    TokenNft: {
      tokenId: string;
      contentType: string;
      contentValue: {
        image: {
          extraSmall: string;
          small: string;
          medium: string;
          large: string;
          original: string;
        };
      };
    }[];
  };
}

export function getNftContent(
  chainId: Chain,
  address: string,
  tokenId: string
) {
  return fetchGql<GetTokenNftsQueryData>(query, {
    blockchain: chainId,
    address,
    tokenId,
  });
}
