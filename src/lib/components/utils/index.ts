import { Chain } from "../../constants";

export function getCacheKey(chain: Chain, address: string, tokenId: string) {
  return `${chain}-${address.toLowerCase()}-${tokenId.toLowerCase()}`;
}
