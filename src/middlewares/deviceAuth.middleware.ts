import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";

const DEVICE_KEY_HEADER = "x-device-key";

export function requireDeviceKey(req: Request, res: Response, next: NextFunction): void {
  if (!env.deviceApiKey) {
    res.status(500).json({
      ok: false,
      error: "DEVICE_API_KEY_NOT_CONFIGURED",
      message: "DEVICE_API_KEY nao configurado no .env da API",
    });
    return;
  }

  const providedKey = req.header(DEVICE_KEY_HEADER);

  if (providedKey !== env.deviceApiKey) {
    res.status(401).json({
      ok: false,
      error: "UNAUTHORIZED",
      message: "Header x-device-key ausente ou invalido",
    });
    return;
  }

  next();
}
