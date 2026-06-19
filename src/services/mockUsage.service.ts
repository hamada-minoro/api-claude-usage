import { UsageSnapshot } from "../types/usage.types";
import { buildDisplay } from "../utils/displayFormatter";

export function getMockUsage(): UsageSnapshot {
  const serverEpoch = Math.floor(Date.now() / 1000);

  const session = {
    label: "SS",
    usedPercent: 72,
    remainingPercent: 28,
    resetIn: "01:34",
    resetAtEpoch: serverEpoch + 94 * 60,
  };

  const week = {
    label: "SM",
    usedPercent: 41,
    remainingPercent: 59,
    resetIn: "3D08H",
    resetAtEpoch: serverEpoch + (3 * 24 + 8) * 3600,
  };

  return {
    ok: true,
    source: "mock",
    updatedAt: new Date().toISOString(),
    serverEpoch,
    session,
    week,
    display: buildDisplay(session, week),
  };
}
