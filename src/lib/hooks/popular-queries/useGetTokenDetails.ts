import { useQuery } from "../useQuery";

const query = `query TokenDetails($address: Address!, $blockchain: TokenBlockchain!) {
  Token(input: {address: $address, blockchain: $blockchain}) {
    name
    symbol
    decimals
    totalSupply
    type
    baseURI
    address
    blockchain
    logo {
      large
      medium
      original
      small
    }
    projectDetails {
      collectionName
      description
      imageUrl
      discordUrl
      externalUrl
      twitterUrl
    }
  }
}`;

export type GetTokenDetailsVariables = {
  address: string;
  blockchain: string;
};

export function useGetTokenDetails(variables: GetTokenDetailsVariables) {
  return useQuery(query, variables);
}
