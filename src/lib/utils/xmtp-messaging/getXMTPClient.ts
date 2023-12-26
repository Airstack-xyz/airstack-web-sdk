import { Client } from "@xmtp/xmtp-js";
import { BrowserProvider, Eip1193Provider } from 'ethers';
import { WalletType } from "../../types/xmtp-messaging";
import { getClientFromCache, putClientIntoCache } from "./clientCache";

// get browser based (MetaMask, Coinbase etc) wallet
async function getBrowserBasedWallet():Promise<WalletType> {
  if (!("ethereum" in window)) {
    throw new Error("Browser based wallet not found");
  }
  const provider = new BrowserProvider(window.ethereum as Eip1193Provider);
  return provider.getSigner();
}

// get xmtp client from cache or create one
export async function getXMTPClient(
  wallet?: WalletType,
  cacheXMTPClient?: boolean
): Promise<Client> {
  let xmtpClient;
  let userWallet = wallet;
  // try to get browser based (MetaMask, Coinbase etc) wallet if wallet is not provided
  if (!userWallet) {
    userWallet = await getBrowserBasedWallet();
  }
  // try to get xmtp client from cache if caching is enabled
  if (cacheXMTPClient) {
    xmtpClient = await getClientFromCache(userWallet);
  }
  // if cached xmtp client doesn't exist then create one
  if (!xmtpClient) {
    xmtpClient = await Client.create(userWallet, { env: "production" });
  }
  // put xmtp client into cache if caching is enabled
  if (cacheXMTPClient) {
    putClientIntoCache(userWallet, xmtpClient);
  }
  return xmtpClient;
}
