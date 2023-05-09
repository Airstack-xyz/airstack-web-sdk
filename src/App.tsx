import React, { useState } from "react";
import "./App.css";
import { init, useQuery } from "./lib/fetchQuery";
import { useQueryWithPagination } from "./lib/useQueryWithPagination";

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
function App() {
  const { data, error, loading, hasNextPage, hasPrevPage, getNextPage, getPrevPage } = useQueryWithPagination(query, variables);
  console.log(" data ", data);
  return (
    <div>
      {loading && <h1> Loading... </h1>}
      {data && <h2>{JSON.stringify(data)}</h2>}
      <button onClick={getPrevPage} disabled={!hasPrevPage}> prev </button>
      <button onClick={getNextPage} disabled={!hasNextPage} > next </button>
    </div>
  );
}

export default App;
