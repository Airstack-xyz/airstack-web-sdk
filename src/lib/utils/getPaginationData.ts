import { ResponseType } from "../types";
import isAliasedPageInfo, { getCursorName } from "./cursor";

export function getPaginationData(_response: ResponseType | null): {
  nextCursors: Record<string, string>;
  prevCursors: Record<string, string>;
  hasNextPage: boolean;
  hasPrevPage: boolean;
} {
  const nextCursors: Record<string, string> = {};
  const prevCursors: Record<string, string> = {};
  let hasNextPage = false;
  let hasPrevPage = false;

  const response = _response || {};

  for (const queryName in response) {
    const query = response[queryName];
    for (const key in query) {
      if (isAliasedPageInfo(key)) {
        const { nextCursor, prevCursor } = query[key as "pageInfo"];

        if (nextCursor) {
          nextCursors[getCursorName(key)] = nextCursor;
        }

        if (prevCursor) {
          prevCursors[getCursorName(key)] = prevCursor;
        }

        if (!hasNextPage) {
          hasNextPage = Boolean(nextCursor);
        }

        if (!hasPrevPage) {
          hasPrevPage = Boolean(prevCursor);
        }
      }
    }
  }

  return {
    nextCursors,
    prevCursors,
    hasNextPage,
    hasPrevPage,
  };
}
