import { ResponseType } from "../types";
import isAliasedPageInfo from "./cursor";

export function getQueriesWithLastPage(data: ResponseType) {
  const queriesWithLastPage: Record<
    string,
    {
      nextCursor: string;
      prevCursor: string;
    }
  > = {};

  for (const queryName in data) {
    const query = data[queryName];
    for (const key in query) {
      if (isAliasedPageInfo(key)) {
        const { nextCursor, prevCursor } = query[key as "pageInfo"];
        if (!nextCursor) {
          queriesWithLastPage[queryName] = {
            nextCursor,
            prevCursor,
          };
        }
      }
    }
  }
  return queriesWithLastPage;
}
