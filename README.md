## Installation

#### With yarn

```sh
yarn add airstack-web-sdk
```

#### With NPM

```sh
npm install airstack-web-sdk
```

## Getting Started

```jsx
import { init, useQueryWithPagination } from "airstack-web-sdk";
init('api-key');
const { data, loading, hasNextPage, hasPrevPage, getNextPage, getPrevPage } =
    useQueryWithPagination(query, variables);

const ComponentOne = () => {
  const { data, loading, hasNextPage, hasPrevPage, getNextPage, getPrevPage } =
    useQueryWithPagination(query, variables);

 return .....
}
```

## API

### useQuery

```jsx
const { data, loading, error } = useQuery(query, variables);
```

## useLazyQuery

```jsx
const [fetch, { data, loading, error }] = useLazyQuery(query, variables);
```

### useQueryWithPagination

```jsx
const { data, loading, hasNextPage, hasPrevPage, getNextPage, getPrevPage } =
  useQueryWithPagination(query, variables);
```

## useLazyQueryWithPagination

```jsx
const [
  fetch,
  { data, loading, hasNextPage, hasPrevPage, getNextPage, getPrevPage },
] = useLazyQueryWithPagination(query, variables);
```
