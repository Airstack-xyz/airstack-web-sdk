import { useQuery } from "../useQuery";

const query = `query GetSubDomains($owner: Identity, $blockchain: Blockchain!) {
  Domains(input: {filter: {owner: {_eq: $owner}}, blockchain: $blockchain}) {
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
        expiryTimestamp
        resolvedAddress
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
    pageInfo {
      nextCursor
      prevCursor
    }
  }
}`;

export type GetSubDomainsVariables = {
  owner: string;
  blockchain: string;
};

export function useGetSubDomains(variables: GetSubDomainsVariables) {
  return useQuery(query, variables);
}
