import { Config, FetchPaginatedQueryReturnType, Variables } from "../types";
import { addPaginationToQuery } from "../utils/addPaginationToQuery";
import { fetchPaginatedQuery } from "./fetchPaginatedQuery";

export async function fetchQueryWithPagination(
  query: string,
  variables?: Variables,
  config?: Config
): FetchPaginatedQueryReturnType {
  const queryWithPagination = await addPaginationToQuery(query);

  return fetchPaginatedQuery(
    queryWithPagination,
    variables || {},
    config || {}
  );
}
