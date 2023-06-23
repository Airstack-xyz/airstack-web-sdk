import { useLazyQueryWithPagination } from "../useQueryWithPagination";

const query = `query GetTokensHeldByWalletAddress($identitity: Identity, $tokenType: [TokenType!], $blockchain: TokenBlockchain!, $limit: Int) {
  TokenBalances(
    input: {filter: {owner: {_eq: $identitity}, tokenType: {_in: $tokenType}}, blockchain: $blockchain, limit: $limit}
  ) {
    TokenBalance {
      amount
      formattedAmount
      blockchain
      tokenAddress
      tokenId
      token {
        name
        symbol
        decimals
        totalSupply
        baseURI
        contractMetaData {
          description
          image
          name
        }
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
        }
      }
      tokenNfts {
        metaData {
          animationUrl
          backgroundColor
          description
          externalUrl
          image
          name
          youtubeUrl
          imageData
        }
        tokenURI
      }
      tokenType
    }
    pageInfo {
      nextCursor
      prevCursor
    }
  }
}`;

export type GetTokenBalancesVariables = {
  identitity: string;
  tokenType: string[];
  blockchain: string;
  limit: number;
};

export function useGetTokenBalances(variables: GetTokenBalancesVariables) {
  return useLazyQueryWithPagination(query, variables);
}
