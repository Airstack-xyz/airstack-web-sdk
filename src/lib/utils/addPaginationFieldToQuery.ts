const REGEXT_LAST_CLOSING_CURLEY_BRACE = /(\}\s*\})$/g;
const PAGINATION_FIELD = `pageInfo {
    nextCursor
    prevCursor
  }`;

export function addPaginationFieldToQuery(query: string): string {
  // if already has pageInfo, then return the query as is
  if (query.indexOf("pageInfo") !== -1) {
    return query;
  }
  // find the last closing curley brace and add pageInfo field before it
  return query.replace(REGEXT_LAST_CLOSING_CURLEY_BRACE, (match) => {
    return PAGINATION_FIELD + match;
  });
}
