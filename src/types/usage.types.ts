export type UsageWindow = {
  label: string;
  usedPercent: number;
  remainingPercent: number;
  resetIn: string;
  // Epoch em segundos (unix time) do momento do reset. Permite que o ESP32
  // calcule o countdown localmente (com segundos), sem depender de cada
  // consulta à API para "andar" o relógio na tela.
  resetAtEpoch: number;
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
  // Epoch em segundos no momento em que este snapshot foi gerado.
  // O ESP32 usa isso como referência para estimar o relógio local entre consultas.
  serverEpoch: number;
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
