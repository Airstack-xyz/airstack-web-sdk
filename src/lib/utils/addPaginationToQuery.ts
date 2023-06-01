import { addCursorVariable } from "./addCursorVariable";

const cache: Record<string, string> = {};

export async function addPaginationToQuery(query: string): Promise<string> {
  if (cache[query]) {
    return cache[query];
  }
  const _query = await addCursorVariable(query);

  if (_query !== query) {
    cache[query] = _query;
  }
  return _query;
}
