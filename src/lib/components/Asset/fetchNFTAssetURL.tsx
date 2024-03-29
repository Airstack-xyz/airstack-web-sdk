import { getNftContent } from "../../apis/getNftContent";
import { addToAssetCache, getFromAssetCache } from "../../cache/assets";
import { Chain } from "../../constants";
import type { NFTAssetURL } from "../../types";

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

export const fetchNFTAssetURL = (
  chain: Chain,
  address: string,
  tokenId: string,
  forceFetch = false
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

    const nftAssetURL = getFromAssetCache(chain, address, tokenId);
    if (!forceFetch && nftAssetURL) {
      //cache hit
      resolve(nftAssetURL);
    } else {
      getNftContent(chain, address, tokenId)
        .then(([data, error]) => {
          const tokenNfts = data?.TokenNfts.TokenNft || [];
          if (error || !data?.TokenNfts) {
            reject(new Error("can't get the data"));
            return;
          }

          tokenNfts.forEach((token) => {
            const assetURLs: NFTAssetURL = {
              type: token.contentType,
              value: token.contentValue,
            };
            addToAssetCache(chain, address, token.tokenId, assetURLs);
          });

          const cache = getFromAssetCache(chain, address, tokenId);

          if (cache) {
            resolve(cache);
          } else {
            reject(new Error("nft content is not available"));
          }
        })
        .catch((err) => reject(err));
    }
  });
};
