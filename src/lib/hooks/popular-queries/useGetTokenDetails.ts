import { useQuery } from "../useQuery";

const query = /* GraphQL */ `
  query TokenDetails($address: Address!, $blockchain: TokenBlockchain!) {
    Tokens(
      input: { filter: { address: { _eq: $address } }, blockchain: $blockchain }
    ) {
      Token {
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
    }
  }
`;

export type GetTokenDetailsVariables = {
  address: string;
  blockchain: string;
};

export function useGetTokenDetails(variables: GetTokenDetailsVariables) {
  return useQuery(query, variables);
}
