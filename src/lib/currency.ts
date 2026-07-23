/** All launch-market amounts are KES. Display uses "KSh" per local convention. */
export function formatKES(amount: number): string {
  const hasCents = Math.round(amount * 100) % 100 !== 0;
  const formatted = amount.toLocaleString("en-KE", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  });
  return `KSh ${formatted}`;
}

export function formatKESRate(rate: number): string {
  return `${formatKES(rate)}/h`;
}
