import { fetchClaudeUsage } from "./claudeUsage.service";
import { getCache, isCacheValid, setCache } from "../cache/usageCache.service";
import { UsageResponse } from "../types/usage.types";

export async function getUsage(): Promise<UsageResponse> {
  if (isCacheValid()) {
    const cached = getCache()!;
    return { ...cached, source: "cache" };
  }

  try {
    const fresh = await fetchClaudeUsage();
    setCache(fresh);
    return fresh;
  } catch (err) {
    const previousCache = getCache();

    if (previousCache) {
      return { ...previousCache, source: "cache" };
    }

    const message = err instanceof Error ? err.message : "Erro desconhecido ao consultar o Claude";
    return {
      ok: false,
      error: "CLAUDE_UNAVAILABLE",
      message,
    };
  }
}
