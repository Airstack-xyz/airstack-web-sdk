import { useQuery } from "../useQuery";

const query = `query GetSubDomains($identity: Identity, $blockchain: Blockchain!) {
  Domains(input: {filter: {owner: {_eq: $identity}}, blockchain: $blockchain}) {
    Domain {
      subDomains {
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
}`;

export type GetSubDomainsVariables = {
  identity: string;
  blockchain: string;
};

export function useGetSubDomains(variables: GetSubDomainsVariables) {
  return useQuery(query, variables);
}
