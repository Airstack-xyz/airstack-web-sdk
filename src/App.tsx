import React, { useState } from "react";
import "./App.css";
import { init } from "./lib/fetchQuery";
import { useLazyQueryWithPagination, useQueryWithPagination } from "./lib/useQueryWithPagination";
import { useLazyQuery } from "./lib/useQuery";

const owners = ["vitalik.eth", "dwr.eth"];
const limit = 10;
init("992ffd31110843858365cd4e5c3131bf");

const query = `query QB2($address: Address, $blockchain: TokenBlockchain!, $limit: Int, $cursor: String) {
  TokenNfts(input: {filter: {address: {_eq: $address}}, blockchain: $blockchain, limit: $limit, , cursor: $cursor}) {
    TokenNft {
      address
      id
      type
    }
    pageInfo {
      nextCursor
      prevCursor
    }
  }
}`;

const variables = {
  "address": "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
  "blockchain": "ethereum",
  "limit": 3
}


function WithPagginationNoCaching () {
  const { data, loading, hasNextPage, hasPrevPage, getNextPage, getPrevPage } = useQueryWithPagination(query, variables, {
    cache: false
  });

  return (
    <div>
      <h2> useQueryWithPagination no catching </h2>
      {loading && <h4> Loading... </h4>}
      {data && <h4>{JSON.stringify(data, null , 4)}</h4>}
      <button onClick={getPrevPage} disabled={!hasPrevPage}> prev </button>
      <button onClick={getNextPage} disabled={!hasNextPage} > next </button>
    </div>
  );
}

function LazyLoad () {
  const [fetch, { data, loading}] = useLazyQuery(query, variables);
  
  return (
    <div>
      {loading && <h4> Loading... </h4>}
      {data && <h4>{JSON.stringify(data, null , "\t")}</h4>}
      <button onClick={() => fetch()} disabled={loading}> fetch </button>
    </div>
  );
}


function App() {
  const { data, loading, hasNextPage, hasPrevPage, getNextPage, getPrevPage } = useQueryWithPagination(query, variables);
  
  return (
    <div>
      <h2> useQueryWithPagination </h2>
      {loading && <h4> Loading... </h4>}
      {data && <h4>{JSON.stringify(data, null ,"\t")}</h4>}
      <button onClick={getPrevPage} disabled={!hasPrevPage}> prev </button>
      <button onClick={getNextPage} disabled={!hasNextPage} > next </button>
      <br/>
      <br/>
      <br/>
      <br/>
      <h2> useLazyQuery </h2>
      <LazyLoad/>

      <br/>
      <br/>
      <br/>
      <br/>
      <WithPagginationNoCaching/>
    </div>
  );
}

export default App;
