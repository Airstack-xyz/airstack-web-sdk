export type PageInfo = {
  prevCursor: string;
  nextCursor: string;
};

export type ResponseType = {
  [key: string]: {
    pageInfo: PageInfo;
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

export type FetchPaginatedQueryReturnType = Promise<FetchQuery>;
export type FetchQueryReturnType = Promise<Pick<FetchQuery, "data" | "error">>;

export type Config = {
  cache?: boolean;
};


export type ConfigAndCallbacks = Config & {
  onCompleted?: (data: any) => void;
  onError?: (error: any) => void;
  dataFormatter?: any;
}

export type Variables = Record<string, any>;

export type NFTAssetURL = {
  type: string;
  value: type["TokenNfts"]["TokenNft"][0]["contentValue"];
};

export type NFTCache = Record<string, NFTAssetURL>;

export interface type {
  TokenNfts: {
    TokenNft: {
      tokenId: string;
      contentType: string;
      contentValue: {
        image?: {
          extraSmall: string;
          small: string;
          medium: string;
          large: string;
          original: string;
        };
        video: string;
        audio: string;
        animation_url?: {
          original: string;
        };
      };
    }[];
  };
}
