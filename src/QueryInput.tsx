import * as React from "react";
import { useLazyQueryWithPagination } from "./lib";

const defaultQuery = `query QB2($address: Address, $blockchain: TokenBlockchain!, $limit: Int) {
    TokenNfts(input: {filter: {address: {_eq: $address}}, blockchain: $blockchain, limit: $limit}) {
      TokenNft {
        address
        id
        type
        tokenId
      }
    }
  }`;

const defaultVariables = {
  address: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
  blockchain: "ethereum",
  limit: 3,
};
export function QueryInput() {
  const [query, setQuery] = React.useState(defaultQuery);
  const [variables, setVariables] = React.useState(
    JSON.stringify(defaultVariables)
  );

  const [
    _fetch,
    {
      data,
      error,
      loading,
      pagination: { hasNextPage, hasPrevPage, getNextPage, getPrevPage },
    },
  ] = useLazyQueryWithPagination(query, {});

  const fetch = () => {
    _fetch(JSON.parse(variables));
  };

  return (
    <div>
      <h2> useQueryWithPagination </h2>
      <div>
        <textarea
          id="query"
          value={query}
          rows={20}
          cols={100}
          placeholder="query"
          onChange={(e) => setQuery(e.target.value)}
        />
        <textarea
          id="variables"
          value={variables}
          rows={10}
          cols={100}
          placeholder="variables json"
          onChange={(e) => setVariables(e.target.value)}
        />
      </div>
      <br />
      <br />
      {!data && (
        <button disabled={loading} onClick={fetch}>
          fetch
        </button>
      )}
      {loading && <h4> Loading... </h4>}
      {error && <h4> Error: {JSON.stringify(error, null, 4)} </h4>}
      {data && <h4>{JSON.stringify(data, null, 4)}</h4>}
      <button onClick={getPrevPage} disabled={!hasPrevPage || loading}>
        Prev
      </button>
      <button onClick={getNextPage} disabled={!hasNextPage || loading}>
        Next
      </button>
    </div>
  );
}
