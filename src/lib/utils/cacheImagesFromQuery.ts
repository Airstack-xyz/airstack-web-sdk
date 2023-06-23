import { addToAssetCache } from "../cache/assets";
import { Chain } from "../constants";

type DataType = Record<string, Record<string, any>>;

function cacheImagesWithTokenRecursive(
  data: any,
  tokenId: string | null,
  tokenAddress: string | null,
  blockchain: Chain | null,
  images: any
): void {
  if (!(data instanceof Object)) {
    return;
  }

  if (Array.isArray(data)) {
    for (const item of data) {
      cacheImagesWithTokenRecursive(
        item,
        tokenId,
        tokenAddress,
        blockchain,
        images
      );
    }
    return;
  }

  for (const key in data) {
    if (key === "blockchain") {
      blockchain = data[key] as Chain;
    }
    if (key === "tokenId") {
      tokenId = data[key] as string;
    }

    if (key === "tokenAddress") {
      tokenAddress = data[key] as string;
    }

    if (key === "contentValue") {
      images = data[key];
    }

    if (blockchain && tokenId && tokenAddress && images) {
      addToAssetCache(blockchain, tokenAddress, tokenId, {
        type: "image",
        value: images,
      });
      continue;
    }

    cacheImagesWithTokenRecursive(
      data[key],
      tokenId,
      tokenAddress,
      blockchain,
      images
    );
  }
}

export function cacheImagesFromQuery(queries: DataType | null | undefined) {
  if (!queries) return;

  for (const queryName in queries) {
    const data = queries[queryName];
    for (const key in data) {
      if (!key.includes("pageInfo")) {
        cacheImagesWithTokenRecursive(data[key], null, null, null, null);
      }
    }
  }
}
