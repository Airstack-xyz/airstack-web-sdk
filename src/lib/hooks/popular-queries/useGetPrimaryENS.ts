import { useQuery } from "../useQuery";

const query = /* GraphQL */ `
  query GetPrimaryENS($identity: Identity!, $blockchain: TokenBlockchain!) {
    Wallet(input: { identity: $identity, blockchain: $blockchain }) {
      primaryDomain {
        name
        dappName
        tokenId
        chainId
        blockchain
        labelName
        labelHash
        owner
        parent
      }
    }
  }
`;

export type GetPrimaryENSVariables = {
  identity: string;
  blockchain: string;
};

export function useGetPrimaryENS(variables: GetPrimaryENSVariables) {
  return useQuery(query, variables);
}
