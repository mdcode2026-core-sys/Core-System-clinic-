export function calculateInvoiceTotal(
  lineItems: { quantity: number; unit_price_subunits: number; discount_subunits?: number }[],
  taxRatePercent = 15
): { subtotal: number; tax: number; total: number } {
  const subtotal = lineItems.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unit_price_subunits;
    const discount = item.discount_subunits ?? 0;
    return sum + itemTotal - discount;
  }, 0);

  const tax = Math.round(subtotal * (taxRatePercent / 100));
  const total = subtotal + tax;

  return { subtotal, tax, total };
}

export function calculateRemainingBalance(
  totalSubunits: number,
  amountPaidSubunits: number
): number {
  return Math.max(0, totalSubunits - amountPaidSubunits);
}
