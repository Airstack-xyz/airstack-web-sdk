import React from "react";
import "./App.css";
import { Asset, init, useLazyQuery, useQueryWithPagination } from "./lib";

init("ef3d1cdeafb642d3a8d6a44664ce566c");

const query = `query QB2($address: Address, $blockchain: TokenBlockchain!, $limit: Int) {
  TokenNfts(input: {filter: {address: {_eq: $address}}, blockchain: $blockchain, limit: $limit}) {
    TokenNft {
      address
      id
      type
      tokenId
    }
  }
}`;

const variables = {
  address: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
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
      <Asset
        address="0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d"
        tokenId="0"
        preset="original"
      />
      <h2> useQueryWithPagination </h2>
      {loading && <h4> Loading... </h4>}
      {error && <h4> Error...</h4>}
      {data && <h4>{JSON.stringify(data, null, "\t")}</h4>}
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
    </div>
  );
}

export default App;
