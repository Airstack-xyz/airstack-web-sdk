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
    getNextPage: () => Promise<FetchQuery | null>;
    getPrevPage: () => Promise<FetchQuery | null>;}

export type FetchQueryReturnType = Promise<FetchQuery>;

export type Config = {
  cache?: boolean;
};

export type Variables = Record<string, any>;