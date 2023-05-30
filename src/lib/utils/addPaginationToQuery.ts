import { addCursorVariable } from "./addCursorVariable";

const REGEXT_LAST_CLOSING_CURLEY_BRACE = /(\}\s*\})$/g;
const PAGINATION_FIELD = `pageInfo {
    nextCursor
    prevCursor
  }`;

const cache: Record<string, string> = {};

export async function addPaginationToQuery(query: string): Promise<string> {
  if (cache[query]) {
    return cache[query];
  }

  // if don't have pageInfo field, add it
  if (query.indexOf("pageInfo") === -1) {
    // find the last closing curley brace and add pageInfo field before it
    query = query.replace(REGEXT_LAST_CLOSING_CURLEY_BRACE, (match) => {
      return PAGINATION_FIELD + match;
    });
  }

  const _query = await addCursorVariable(query);

  if (_query !== query) {
    cache[query] = _query;
  }
  return _query;
}
