import { buildProgressBar, fitLcdLine } from "./progressBar";
import { UsageDisplay, UsageWindow } from "../types/usage.types";

export function buildSessionLines(session: UsageWindow): { line1: string; line2: string } {
  // "S " (2) + barra (10) + percentual (4, ex: " 72%" / "100%") = 16 colunas exatas.
  const bar = buildProgressBar(session.usedPercent).padEnd(10, " ");
  const percentText = `${session.usedPercent}%`.padStart(4, " ");
  const line1 = fitLcdLine(`S ${bar}${percentText}`);
  const line2 = fitLcdLine(`RST ${session.resetIn}`);
  return { line1, line2 };
}

export function buildWeekLines(week: UsageWindow): { line1: string; line2: string } {
  const bar = buildProgressBar(week.usedPercent);
  const line1 = fitLcdLine(`${week.label} ${bar}${week.usedPercent}%`);
  const line2 = fitLcdLine(`RST ${week.resetIn}`);
  return { line1, line2 };
}

export function buildResetLines(session: UsageWindow, week: UsageWindow): { line1: string; line2: string } {
  const line1 = fitLcdLine(`${session.label} RST ${session.resetIn}`);
  const line2 = fitLcdLine(`${week.label} RST ${week.resetIn}`);
  return { line1, line2 };
}

export function buildStatusLines(wifiOk: boolean, apiOk: boolean): { line1: string; line2: string } {
  const line1 = fitLcdLine(wifiOk ? "WIFI OK" : "WIFI ERRO");
  const line2 = fitLcdLine(apiOk ? "API OK" : "API ERRO");
  return { line1, line2 };
}

export function buildDisplay(session: UsageWindow, week: UsageWindow): UsageDisplay {
  const sessionLines = buildSessionLines(session);
  const weekLines = buildWeekLines(week);
  const resetLines = buildResetLines(session, week);
  const statusLines = buildStatusLines(true, true);

  return {
    sessionLine1: sessionLines.line1,
    sessionLine2: sessionLines.line2,
    weekLine1: weekLines.line1,
    weekLine2: weekLines.line2,
    resetLine1: resetLines.line1,
    resetLine2: resetLines.line2,
    statusLine1: statusLines.line1,
    statusLine2: statusLines.line2,
  };
}
