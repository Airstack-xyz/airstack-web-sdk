import { ResponseType, VariablesType } from "./types";

const CACHE_EXPIRATION = 1000 * 60; // 1 minute

type Cache = {
  [key: string]: {
    data: ResponseType;
    createdAt: number;
  };
};

const cache: Cache = {};

export function createCacheKey(query: string, variables: VariablesType = {}) {
  let key = `${query}=`;
  const keys = Object.keys(variables).sort();
  for (const k of keys) {
    key += `${k}:${variables[k]} `;
  }
  return key.trim();
}

function isCacheValid(createdAt: number) {
  return Date.now() - createdAt < CACHE_EXPIRATION;
}

export function getFromCache<C extends ResponseType>(
  query: string,
  variables = {}
): C | null {
  const key = createCacheKey(query, variables);
  const cachedData = cache[key];
  if (!cachedData) return null;
  const isValidCache = isCacheValid(cachedData.createdAt);
  return isValidCache ? (cachedData.data as C) : null;
}

export function cacheResponse(
  response: ResponseType,
  query: string,
  variables = {}
) {
  const key = createCacheKey(query, variables);
  cache[key] = {
    data: response,
    createdAt: Date.now(),
  };
}
