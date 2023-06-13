import { useLazyQueryWithPagination } from "../useQueryWithPagination";

const query = `query GetTokenCollectionOwners($tokenTypes: [TokenType!], $blockchain: TokenBlockchain!, $limit: Int) {
  TokenBalances(
    input: {filter: {tokenType: {_in: $tokenTypes}}, blockchain: $blockchain, limit: $limit}
  ) {
    TokenBalance {
      owner {
        addresses
        primaryDomain {
          name
        }
        domains {
          name
        }
        socials {
          dappName
          profileName
          userAddress
          userAssociatedAddresses
        }
      }
    }
    pageInfo{
      nextCursor
      prevCursor
    }
  }
}`;

export type GetTokenCollectionOwnersVariables = {
  tokenTypes: string[];
  blockchain: string;
  limit: number;
};

export function useGetTokenCollectionOwners(
  variables: GetTokenCollectionOwnersVariables
) {
  return useLazyQueryWithPagination(query, variables);
}
