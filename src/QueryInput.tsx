import * as React from "react";
import { useLazyQueryWithPagination } from "./lib";

const defaultQuery = `query GetPOAPs($owner: Identity, $cursor: String) {
  Poaps(input: {filter: {owner: {_eq: $owner}}, blockchain: ALL, cursor: $cursor}) {
    Poap {
      poapEvent {
        eventName
        startDate
        isVirtualEvent
        eventId
        logo: contentValue {
          image {
            small
          }
        }
      }
    }
    pageInfo {
      nextCursor
      prevCursor
    }
  }
}`;

const defaultVariables = {
  owner: "vitalik.eth",
  limit: 20,
};

const getQuery = () => {
  return localStorage.getItem("query") || defaultQuery;
};

const getVariables = () => {
  return localStorage.getItem("variables") || JSON.stringify(defaultVariables);
};

export function QueryInput() {
  const [query, _setQuery] = React.useState(getQuery);
  const [variables, _setVariables] = React.useState(getVariables);

  const setQuery = (query: string) => {
    localStorage.setItem("query", query);
    _setQuery(query);
  };

  const setVariables = (variables: string) => {
    localStorage.setItem("variables", variables);
    _setVariables(variables);
  };

  const [
    _fetch,
    {
      data,
      error,
      loading,
      pagination: { hasNextPage, hasPrevPage, getNextPage, getPrevPage },
    },
  ] = useLazyQueryWithPagination(query, {}, {
    onCompleted: (data) => {
      console.log(" onCompleted: ", data)
    },
    onError: (error) => {
      console.log(" onError: ", error)
    },
    dataFormatter: (data) => {
      return [data.erc20, data._erc20]
    }
  });

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
