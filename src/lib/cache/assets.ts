import { Chain } from "../constants";
import { NFTCache, NFTAssetURL } from "../types";

const assetCache: NFTCache = {};

function getAssetCacheKey(chain: Chain, address: string, tokenId: string) {
  return `${chain}-${address.toLowerCase()}-${tokenId.toLowerCase()}`;
}

export function addToAssetCache(
  chain: Chain,
  address: string,
  tokenId: string,
  content: NFTAssetURL
) {
  const key = getAssetCacheKey(chain, address, tokenId);
  assetCache[key] = content;
}

export function getFromAssetCache(
  chain: Chain,
  address: string,
  tokenId: string
): NFTAssetURL | undefined {
  const key = getAssetCacheKey(chain, address, tokenId);
  return assetCache[key];
}
