import { Router } from "express";
import { getMockUsage } from "../services/mockUsage.service";
import { getUsage } from "../services/usage.service";
import { getCacheDebugInfo } from "../cache/usageCache.service";

export const usageRouter = Router();

usageRouter.get("/usage/mock", (_req, res) => {
  res.json(getMockUsage());
});

usageRouter.get("/usage", async (_req, res) => {
  const result = await getUsage();
  res.status(result.ok ? 200 : 503).json(result);
});

usageRouter.get("/debug/cache", (_req, res) => {
  res.json(getCacheDebugInfo());
});
