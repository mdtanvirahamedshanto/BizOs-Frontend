/** Convert integer cents to taka (BDT) for display. */
export function centsToTaka(cents: number): number {
  return cents / 100;
}

/** Convert taka amount to integer cents for API payloads. */
export function takaToCents(taka: number): number {
  return Math.round(taka * 100);
}
