export function round(n: number, dp: number) {
  const h = +"1".padEnd(dp + 1, "0");
  return Math.round(n * h) / h;
}
