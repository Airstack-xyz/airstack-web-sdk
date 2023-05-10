import { getNftContent } from "../api/getNftContent";
import { Chain } from "../../constants";
import type { NFTCache, NFTAssetURL } from "../../types";
import { getCacheKey } from "../utils";

export interface AirstackAssetContextInterface {
  fetchCachedNFTAssetURL: (
    chain: Chain,
    address: string,
    tokenId: string
  ) => NFTAssetURL;

  fetchNFTAssetURLs: (
    chain: Chain,
    address: string,
    tokenIds: Array<string>
  ) => Promise<Record<string, NFTAssetURL>>;

  fetchNFTAssetURL: (
    chain: Chain,
    address: string,
    tokenId: string
  ) => Promise<NFTAssetURL>;
}

const cache: NFTCache = {};

export const fetchCachedNFTAssetURL = (
  chain: Chain,
  address: string,
  tokenId: string
): NFTAssetURL => {
  const key = getCacheKey(chain, address, tokenId);
  return cache[key];
};

export const fetchNFTAssetURL = (
  chain: Chain,
  address: string,
  tokenId: string
): Promise<NFTAssetURL> => {
  return new Promise((resolve, reject) => {
    if (address.length === 0) {
      reject("invalid address");
      return;
    }

    if (tokenId.length === 0) {
      reject("invalid tokenId");
      return;
    }

    const cacheKey = getCacheKey(chain, address, tokenId);
    const nftAssetURL = cache[cacheKey];
    if (nftAssetURL) {
      //cache hit
      resolve(nftAssetURL);
    } else {
      getNftContent(chain, address, tokenId)
        .then(([data, error]) => {
          const tokenNfts = data?.TokenNfts.TokenNft || [];
          if (error || !data.TokenNfts) {
            reject(new Error("can't get the data"));
            return;
          }

          tokenNfts.forEach((token) => {
            const key = getCacheKey(chain, address, token.tokenId);
            const assetURLs: NFTAssetURL = {
              type: token.contentType,
              value: token.contentValue?.image,
            };
            cache[key] = assetURLs;
          });

          if (cache[cacheKey]) {
            resolve(cache[cacheKey]);
          } else {
            reject(new Error("nft content is not available"));
          }
        })
        .catch((err) => reject(err));
    }
  });
};
