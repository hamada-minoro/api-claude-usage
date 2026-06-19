export type UsageWindow = {
  label: string;
  usedPercent: number;
  remainingPercent: number;
  resetIn: string;
};

export type UsageDisplay = {
  sessionLine1: string;
  sessionLine2: string;
  weekLine1: string;
  weekLine2: string;
  resetLine1: string;
  resetLine2: string;
  statusLine1: string;
  statusLine2: string;
};

export type UsageSource = "cache" | "claude" | "mock";

export type UsageSnapshot = {
  ok: true;
  source: UsageSource;
  updatedAt: string;
  session: UsageWindow;
  week: UsageWindow;
  display: UsageDisplay;
};

export type UsageError = {
  ok: false;
  error: string;
  message: string;
};

export type UsageResponse = UsageSnapshot | UsageError;
