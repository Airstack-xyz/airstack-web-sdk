export type ResponseType = {
  [key: string]: {
    pageInfo: {
      prevCursor: string;
      nextCursor: string;
    };
  };
};

export type QueryContext = { variableNamesMap: Record<string, number> };

export type FetchQuery = {
  data: any;
  error: any;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  getNextPage: () => Promise<FetchQuery | null>;
  getPrevPage: () => Promise<FetchQuery | null>;
};

export type FetchQueryReturnType = Promise<FetchQuery>;

export type Config = {
  cache?: boolean;
};

export type Variables = Record<string, any>;

export interface NFTAssetURL {
  type: string;
  value: {
    extraSmall: string;
    small: string;
    medium: string;
    large: string;
    original: string;
  };
}

export type NFTCache = Record<string, NFTAssetURL>;
