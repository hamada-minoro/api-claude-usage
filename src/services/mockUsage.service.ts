import { UsageSnapshot } from "../types/usage.types";
import { buildDisplay } from "../utils/displayFormatter";

export function getMockUsage(): UsageSnapshot {
  const session = {
    label: "SS",
    usedPercent: 72,
    remainingPercent: 28,
    resetIn: "01:34",
  };

  const week = {
    label: "SM",
    usedPercent: 41,
    remainingPercent: 59,
    resetIn: "3D08H",
  };

  return {
    ok: true,
    source: "mock",
    updatedAt: new Date().toISOString(),
    session,
    week,
    display: buildDisplay(session, week),
  };
}
