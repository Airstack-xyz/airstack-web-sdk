import React from "react";
import "./App.css";
import { Asset, init, useLazyQuery, useQueryWithPagination } from "./lib";

init("ef3d1cdeafb642d3a8d6a44664ce566c");

const query = `
query MyQuery($limit: Int, $blockchain: TokenBlockchain!) {
  TokenBalances(
    input: {filter: {owner: {_eq: "betashop.eth"}}, blockchain: $blockchain, limit: $limit}
  ) {
    TokenBalance {
      tokenAddress
      amount
      formattedAmount
    }
  }
  Socials(
    input: {filter: {dappName: {_eq: farcaster}}, blockchain: ethereum, limit: $limit}
  ) {
    Social {
      profileName
      userAssociatedAddresses
    }
    pageInfo{
      prevCursor
      nextCursor
    }
  }
  Token(
    input: {address: "0x0c3a405727dea8c9fa51fd931ed223535412f7ac", blockchain: ethereum}
  ) {
    id
  }
}`;

const variables = {
  identity: "0xfbd33ca37e9482ac5f91e1dbe155c0ef4d8f84fd",
  blockchain: "ethereum",
  limit: 3,
};

function WithPagginationNoCaching() {
  const {
    data,
    loading,
    pagination: { hasNextPage, hasPrevPage, getNextPage, getPrevPage },
  } = useQueryWithPagination(query, variables, {
    cache: false,
  });

  return (
    <div>
      <h2> useQueryWithPagination no catching </h2>
      {loading && <h4> Loading... </h4>}
      {data && <h4>{JSON.stringify(data, null, 4)}</h4>}
      <button onClick={getPrevPage} disabled={!hasPrevPage}>
        {" "}
        prev{" "}
      </button>
      <button onClick={getNextPage} disabled={!hasNextPage}>
        {" "}
        next{" "}
      </button>
    </div>
  );
}

function LazyLoad() {
  const [fetch, { data, loading }] = useLazyQuery(query, variables);

  return (
    <div>
      {loading && <h4> Loading... </h4>}
      {data && <h4>{JSON.stringify(data, null, "\t")}</h4>}
      <button onClick={() => fetch()} disabled={loading}>
        fetch
      </button>
      <div>{data?.TokenNfts?.TokenNft.length}</div>
      {data?.TokenNfts?.TokenNft.map(({ address, tokenId }) => (
        <Asset address={address} tokenId={tokenId} preset="extraSmall" />
      ))}
    </div>
  );
}

function App() {
  const _variables = { ...variables };
  const {
    data,
    error,
    loading,
    pagination: { hasNextPage, hasPrevPage, getNextPage, getPrevPage },
  } = useQueryWithPagination(query, _variables);

  if (error) {
    console.log({ error }, error);
  }

  return (
    <div>
      <h2> useQueryWithPagination </h2>
      {loading && <h4> Loading... </h4>}
      {error && <h4> Error...</h4>}
      {data && (
        <div>
          {Object.keys(data).map((key) => {
            return (
              <div>
                <h4>{key}</h4>
                {JSON.stringify(data[key], null, 4)}
              </div>
            );
          })}
        </div>
      )}
      <button onClick={getPrevPage} disabled={!hasPrevPage}>
        {" "}
        prev{" "}
      </button>
      <button onClick={getNextPage} disabled={!hasNextPage}>
        {" "}
        next{" "}
      </button>
      <br />
      <br />
      <br />
      <br />
      <h2> useLazyQuery </h2>
      <LazyLoad />

      <br />
      <br />
      <br />
      <br />
      <WithPagginationNoCaching />
      <div style={{ marginBottom: "100vh" }}></div>
      <Asset
        address="0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d"
        tokenId="0"
        preset="original"
      />
      <div style={{ marginBottom: "100vh" }}></div>
      <Asset
        address="0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d"
        tokenId="0"
        preset="original"
      />
    </div>
  );
}

export default App;
