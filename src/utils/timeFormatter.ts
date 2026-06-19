export function formatCountdownHHMM(resetAtEpochSeconds: string | null, now = Date.now()): string {
  if (!resetAtEpochSeconds) return "--:--";

  const resetAt = Number(resetAtEpochSeconds) * 1000;
  const diffMs = Math.max(0, resetAt - now);
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60) % 100;
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function formatCountdownDH(resetAtEpochSeconds: string | null, now = Date.now()): string {
  if (!resetAtEpochSeconds) return "--D--H";

  const resetAt = Number(resetAtEpochSeconds) * 1000;
  const diffMs = Math.max(0, resetAt - now);
  const totalHours = Math.floor(diffMs / 3600000);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  return `${days}D${String(hours).padStart(2, "0")}H`;
}
