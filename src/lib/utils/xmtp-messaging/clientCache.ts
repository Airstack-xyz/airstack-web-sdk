import { Client } from "@xmtp/xmtp-js";
import { WalletType } from "../../types/xmtp-messaging";

const CACHE_EXPIRATION = 1000 * 60 * 10; // 10 minutes

type XMTPClientCache = Map<
  string,
  {
    client: Client;
    createdAt: number;
  }
>;

const clientCache: XMTPClientCache = new Map();

async function getClientCacheKey(wallet: WalletType) {
  if ("address" in wallet) {
    return wallet.address as string;
  }
  if ("getAddress" in wallet) {
    return wallet.getAddress();
  }
}

function isClientCacheValid(createdAt: number) {
  return Date.now() - createdAt < CACHE_EXPIRATION;
}

export async function getClientFromCache(wallet: WalletType) {
  const key = await getClientCacheKey(wallet);
  if (!key) return null;
  const cachedData = clientCache.get(key);
  if (!cachedData || !isClientCacheValid(cachedData.createdAt)) return null;
  return cachedData.client;
}

export async function putClientIntoCache(wallet: WalletType, client: Client) {
  const key = await getClientCacheKey(wallet);
  if (!key) return null;
  clientCache.set(key, {
    client,
    createdAt: Date.now(),
  });
}
