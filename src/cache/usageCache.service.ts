import { env } from "../config/env";
import { UsageSnapshot } from "../types/usage.types";

let cachedSnapshot: UsageSnapshot | null = null;
let cachedAt = 0;

const ttlMs = env.cacheTtlSeconds * 1000;

export function getCache(): UsageSnapshot | null {
  return cachedSnapshot;
}

export function isCacheValid(): boolean {
  if (!cachedSnapshot) return false;
  return Date.now() - cachedAt < ttlMs;
}

export function setCache(snapshot: UsageSnapshot): void {
  cachedSnapshot = snapshot;
  cachedAt = Date.now();
}

export function getCacheDebugInfo() {
  const now = Date.now();
  const hasCache = cachedSnapshot !== null;
  const expiresInMs = hasCache ? Math.max(0, ttlMs - (now - cachedAt)) : 0;

  return {
    hasCache,
    ttlMs,
    expiresInMs,
    lastUpdatedAt: hasCache ? cachedSnapshot!.updatedAt : null,
  };
}
