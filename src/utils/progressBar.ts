export function buildProgressBar(percent: number): string {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const blocks = Math.floor(clamped / 10);
  return "#".repeat(blocks);
}

export function fitLcdLine(text: string, width = 16): string {
  return text.length > width ? text.slice(0, width) : text;
}
