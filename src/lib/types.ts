export type PageInfo = {
  prevCursor: string;
  nextCursor: string;
};

export type ResponseType = Record<string, any>;

export type QueryContext = { variableNamesMap: Record<string, number> };

export type FetchQuery<D> = {
  data: D | null;
  error: any;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  getNextPage: () => Promise<FetchQuery<D> | null>;
  getPrevPage: () => Promise<FetchQuery<D> | null>;
};

export type FetchPaginatedQueryReturnType<D> = Promise<FetchQuery<D>>;
export type FetchQueryReturnType<D> = Promise<
  Pick<FetchQuery<D>, "data" | "error">
>;

export type Config = {
  cache?: boolean;
};

export type ConfigAndCallbacks = Config & {
  onCompleted?: (data: any) => void;
  onError?: (error: any) => void;
  dataFormatter?: any;
};

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
