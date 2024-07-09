import { useQuery } from "../useQuery";

const query = /* GraphQL */ `
  query GetENSSubDomains($owner: Identity, $blockchain: Blockchain!) {
    Domains(
      input: { filter: { owner: { _eq: $owner } }, blockchain: $blockchain }
    ) {
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
  }
`;

export type GetENSSubDomainsVariables = {
  owner: string;
  blockchain: string;
};

export function useGetENSSubDomains(variables: GetENSSubDomainsVariables) {
  return useQuery(query, variables);
}
