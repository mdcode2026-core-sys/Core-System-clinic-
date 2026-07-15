export function formatCurrency(subunits: number, currency = "SAR"): string {
  const amount = subunits / 100;
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency,
  }).format(amount);
}

export function subunitsToUnits(subunits: number): number {
  return subunits / 100;
}

export function unitsToSubunits(units: number): number {
  return Math.round(units * 100);
}
