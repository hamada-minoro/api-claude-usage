import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 3333),
  nodeEnv: process.env.NODE_ENV ?? "development",
  claudeOauthToken: process.env.CLAUDE_OAUTH_TOKEN ?? "",
  claudeApiUrl: process.env.CLAUDE_API_URL ?? "https://api.anthropic.com/v1/messages",
  cacheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS ?? 120),
  deviceApiKey: process.env.DEVICE_API_KEY ?? "",
};
