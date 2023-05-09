export type ResponseType = {
  [key: string]: {
    pageInfo: {
      prevCursor: string;
      nextCursor: string;
    };
  };
};

export type FetchQuery = {
    data: any;
    error: any;
    hasNextPage: boolean;
    hasPrevPage: boolean; 
    next: () => Promise<FetchQuery | null>;
    prev: () => Promise<FetchQuery | null>;}

export type FetchQueryReturnType = Promise<FetchQuery>;

export type Config = {
  fetchPolicy?: "cache-first" | "network-only";
};
