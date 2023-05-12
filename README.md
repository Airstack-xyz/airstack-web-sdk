# Airstack Web SDK

The Airstack Web SDK provides a set of react hooks and components for web developers to easily integrate Airstack's blockchain functionalities into their web applications. 
With this SDK, developers can perform various tasks, such as querying and fetching data from smart contracts, displaying NFT assets.

## Installation
#### With NPM

```sh
npm install airstack-react
```

#### With yarn

```sh
yarn add airstack-react
```



## Getting started

To use the SDK you will need airstack api-key, which you can find in your profile setting section in [airstack web](https://app.airstack.xyz), once you have it you can call the `init` function with the api-key.

**`init` must be called before any of the SDK hook or component is used**, we recommend to use `init` in the *App.ts* file.

```jsx
import { init, useQuery } from "airstack-react";

init('api-key');

const MyComponent = () => {
  const { data, loading, error } = useQuery(query, variables, { cache: false });

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  // Render your component using the data returned by the query
};
```


## Hooks

**All the hooks take 3 parameters** 

-   `query` (required): A string that represents the Airstack GraphQL query to be executed.
-   `variables`: An object that contains variables used in the query.
-   `config` (optional): An object that contains optional configuration parameters for the request. Currently, the only available parameter is `cache`, which is a boolean that determines whether to cache the response or not.

```jsx
const { data, loading, error } = useQuery(query, variables, {cache:false});
```
### Query Hooks
### useQuery

The `useQuery` hook loads query data as soon as the component is mounted. It returns an object with the following properties:

- `data`: the data returned by the query.
- `loading`: a boolean indicating whether the query is currently loading.
- `error`: any error that occurred while loading the query.

#### Example

```jsx
import { useQuery } from "airstack-react";

const MyComponent = () => {
  const { data, loading, error } = useQuery(query, variables);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  // Render your component using the data returned by the query
};
```

### useLazyQuery

The `useLazyQuery` hook is used when you want to fetch query data manually, instead of automatically when the component mounts. It returns an array with two items:

- `fetch`: a function that can be called to execute the query.
- An object with the same properties as the object returned by `useQuery`: `data`, `loading`, and `error`.

#### Example

```jsx
import { useLazyQuery } from "airstack-react";

const MyComponent = () => {
  const [fetch, { data, loading, error }] = useLazyQuery(query, variables);

  const handleClick = () => {
    fetch();
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  // Render your component using the data returned by the query
};
```
### Pagination Hooks
**Note:** *pagination hooks only works with queries that has support for pagination, and the query passed to hook must have a cursor as argument for it to work.*

**Example of a Query with cursor**
```jsx
query GetNfts($cursor: String) {
  TokenNfts(input: {cursor: $cursor}) {
    .....
  }
}
```
### useQueryWithPagination

The `useQueryWithPagination` hook provides a simple way to paginate the data returned by a query. It works the same as the `useQuery` hook, but also returns an object with the following properties:

- `pagination`: an object with the following properties:
  - `hasNextPage`: a boolean indicating whether there is another page of data after the current page.
  - `hasPrevPage`: a boolean indicating whether there is another page of data before the current page.
  - `getNextPage`: a function that can be called to fetch the next page of data.
  - `getPrevPage`: a function that can be called to fetch the previous page of data.


#### Example

```jsx
import { useQueryWithPagination } from "airstack-react";

const MyComponent = () => {
  const { data, loading, pagination } = useQueryWithPagination(query, variables);
  const { hasNextPage, hasPrevPage, getNextPage, getPrevPage } = pagination;

  const handleNextPage = () => {
    getNextPage();
  };

  const handlePrevPage = () => {
    getPrevPage();
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  // Render your component using the data returned by the query
};
```

### useLazyQueryWithPagination

The useLazyQueryWithPagination hook is used when you want to manually fetch paginated data. It returns an array with two items:

1. `fetch`: a function that can be called to execute the query.
2. An object with the same properties as the object returned by useQueryWithPagination: `data`, `loading`, and `pagination`.

The `fetch` function can be called whenever you want to execute the query, for example, in response to a user action like clicking a button to load more data. The hook returns the `data`, `loading`, and `pagination` properties just like useQueryWithPagination.

Here's an example of using useLazyQueryWithPagination:

```jsx
import { useLazyQueryWithPagination } from "airstack-react";

function Component() {
  const [fetchData, { data, loading, pagination }] = useLazyQueryWithPagination(
    query,
    variables
  );

  const loadMore = () => {
    if (pagination.hasNextPage) {
      pagination.getNextPage();
    }
  };

  return (
    <div>
      <button onClick={fetchData}>Fetch Data</button>
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      {pagination.hasNextPage && <button onClick={loadMore}>Load More</button>}
      {loading && <p>Loading...</p>}
    </div>
  );
}
```

In the example, we define a `loadMore` function that gets called when a user clicks a "Load More" button. The `loadMore` function checks if there is a next page using `pagination.hasNextPage` and calls `pagination.getNextPage()` to fetch the next page of data.

Note that when using `useLazyQueryWithPagination`, you will need to handle the fetching of the initial data yourself. In the example, we call the `fetchData` function to fetch the initial data when the user clicks the "Fetch Data" button.

## Components

### Asset
The `Asset` component can be used to load and display NFT assets in your React application. 

### Props

- `chain` (optional): a string representing the blockchain network to use. Defaults to `"ethereum"`.
- `address` (required): a string representing the contract address of the NFT.
- `tokenId` (required): a string representing the token ID of the NFT.
- `loading` (optional): a React node to show while the asset is loading.
- `error` (optional): a React node to show if there is an error loading the asset.
- `imgProps` (optional): an object of HTML image attributes to pass to the underlying image element.
- `preset` (optional): a string representing the size of the asset image to display. Can be one of `"extraSmall"`, `"small"`, `"medium"`, `"large"`, or `"original"`. Defaults to `"medium"`.

### Example

```jsx
import { Asset } from "airstack-react";

function App() {
  return (
    <div>
      <Asset
        chain="ethereum"
        address="0x...",
        tokenId="tokenId"
        loading={<div>Loading...</div>}
        error={<div>Error loading asset.</div>}
        imgProps={{alt: "my asset"}}
        preset="medium"
      />
    </div>
  );
}
```

## fetchQuery

fetchQuery can be used in places where using hooks is not possible. `fetchQuery` take same parameter as hooks.

`fetchQuery` returns a promise with an object, which contains the following properties:

- `data`: The response data returned by the server.
- `error`: An error object, if an error occurred during the network request.
- `hasNextPage`: A boolean that indicates whether there is a next page of data available.
- `hasPrevPage`: A boolean that indicates whether there is a previous page of data available.
- `getNextPage()`: A function that returns a next page of data. Returns `null` if there is no next page.
- `getPrevPage()`: A function that returns previous page of data. Returns `null` if there is no previous page.

**Note: you must pass a query which supports pagination, the query must have `pageInfo` field for pagination to work.**

### Example

```typescript
import { fetchQuery } from './fetchQuery';

const { data, error, hasNextPage, hasPrevPage, getNextPage, getPrevPage } = await fetchQuery(query, variables, config);
```