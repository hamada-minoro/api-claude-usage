import { env } from "../config/env";
import { UsageSnapshot } from "../types/usage.types";
import { buildDisplay } from "../utils/displayFormatter";
import { formatCountdownDH, formatCountdownHHMM } from "../utils/timeFormatter";

const SESSION_UTILIZATION_HEADER = "anthropic-ratelimit-unified-5h-utilization";
const SESSION_RESET_HEADER = "anthropic-ratelimit-unified-5h-reset";
const WEEK_UTILIZATION_HEADER = "anthropic-ratelimit-unified-7d-utilization";
const WEEK_RESET_HEADER = "anthropic-ratelimit-unified-7d-reset";

export class ClaudeUsageError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

function parseUtilizationPercent(rawValue: string | null): number | null {
  if (rawValue === null) return null;

  const value = Number(rawValue);
  if (Number.isNaN(value)) return null;

  const percent = value <= 1 ? value * 100 : value;
  return Math.max(0, Math.min(100, Math.round(percent)));
}

export async function fetchClaudeUsage(): Promise<UsageSnapshot> {
  if (!env.claudeOauthToken) {
    throw new ClaudeUsageError(
      "MISSING_TOKEN",
      "CLAUDE_OAUTH_TOKEN nao configurado no .env"
    );
  }

  let response: Response;

  try {
    response = await fetch(env.claudeApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        Authorization: `Bearer ${env.claudeOauthToken}`,
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1,
        messages: [{ role: "user", content: "ping" }],
      }),
    });
  } catch (err) {
    throw new ClaudeUsageError("CLAUDE_UNREACHABLE", "Nao foi possivel conectar a API da Anthropic");
  }

  const sessionUsedPercent = parseUtilizationPercent(response.headers.get(SESSION_UTILIZATION_HEADER));
  const weekUsedPercent = parseUtilizationPercent(response.headers.get(WEEK_UTILIZATION_HEADER));

  if (sessionUsedPercent === null || weekUsedPercent === null) {
    throw new ClaudeUsageError(
      "MISSING_USAGE_HEADERS",
      "Resposta da Anthropic nao trouxe os headers de utilizacao esperados"
    );
  }

  const sessionResetAt = response.headers.get(SESSION_RESET_HEADER);
  const weekResetAt = response.headers.get(WEEK_RESET_HEADER);

  const session = {
    label: "SS",
    usedPercent: sessionUsedPercent,
    remainingPercent: 100 - sessionUsedPercent,
    resetIn: formatCountdownHHMM(sessionResetAt),
  };

  const week = {
    label: "SM",
    usedPercent: weekUsedPercent,
    remainingPercent: 100 - weekUsedPercent,
    resetIn: formatCountdownDH(weekResetAt),
  };

  return {
    ok: true,
    source: "claude",
    updatedAt: new Date().toISOString(),
    session,
    week,
    display: buildDisplay(session, week),
  };
}
