// ============================================================
// src/domain/invoicing/invoicing.calculator.ts
// Phase 5 — Invoice Calculation Engine
// ============================================================

import type { Locale } from "@/core/i18n/messages";
import type { LineItemCalculation, InvoiceCalculation } from "./invoicing.types";

export const DEFAULT_TAX_RATE_PERCENT = 16;
export const CURRENCY_SUBUNIT = 100;
export function toSubunits(amount: number): number { return Math.round(amount * CURRENCY_SUBUNIT); }
export function fromSubunits(subunits: number): number { return subunits / CURRENCY_SUBUNIT; }

/**
 * Currency presentation is locale-aware but never country-bound.
 * Currency itself remains an independent clinic/system preference.
 * Western digits are enforced for both Arabic and English UI.
 */
export function formatCurrency(subunits: number, currency = "JOD", locale: Locale = "ar"): string {
  const amount = fromSubunits(subunits);
  return new Intl.NumberFormat(locale === "ar" ? "ar" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    numberingSystem: "latn",
  }).format(amount);
}

export interface CalculateLineItemInput { quantity: number; unitPriceSubunits: number; discountAmountSubunits?: number; discountPercent?: number | null; taxRatePercent?: number | null; taxIncluded?: boolean; }
export function calculateLineItem(input: CalculateLineItemInput): LineItemCalculation {
  const { quantity, unitPriceSubunits, discountAmountSubunits = 0, discountPercent = null, taxRatePercent = null, taxIncluded = false } = input;
  if (quantity <= 0) throw new Error("Quantity must be positive");
  if (unitPriceSubunits < 0) throw new Error("Unit price cannot be negative");
  const baseTotal = quantity * unitPriceSubunits;
  let effectiveDiscountAmount = discountAmountSubunits;
  if (discountPercent !== null && discountPercent > 0) effectiveDiscountAmount = Math.round(baseTotal * (discountPercent / 100));
  effectiveDiscountAmount = Math.max(0, Math.min(effectiveDiscountAmount, baseTotal));
  const amountAfterDiscount = baseTotal - effectiveDiscountAmount;
  const effectiveTaxRate = taxRatePercent ?? DEFAULT_TAX_RATE_PERCENT;
  const taxAmount = taxIncluded ? Math.round(amountAfterDiscount * (effectiveTaxRate / (100 + effectiveTaxRate))) : Math.round(amountAfterDiscount * (effectiveTaxRate / 100));
  const lineTotal = taxIncluded ? amountAfterDiscount : amountAfterDiscount + taxAmount;
  return { unitPrice: unitPriceSubunits, quantity, discountAmount: effectiveDiscountAmount, discountPercent, taxRate: effectiveTaxRate, taxAmount, lineTotal };
}

export interface CalculateInvoiceInput { items: { quantity: number; unitPriceSubunits: number; discountAmountSubunits?: number; discountPercent?: number | null; taxRatePercent?: number | null; taxIncluded?: boolean; }[]; globalDiscountSubunits?: number; }
export function calculateInvoiceTotals(input: CalculateInvoiceInput): InvoiceCalculation { const { items, globalDiscountSubunits = 0 } = input; let subtotal = 0; let totalDiscount = 0; let totalTax = 0; for (const item of items) { const calc = calculateLineItem(item); subtotal += calc.unitPrice * calc.quantity; totalDiscount += calc.discountAmount; totalTax += calc.taxAmount; } const effectiveGlobalDiscount = Math.min(globalDiscountSubunits, subtotal - totalDiscount); totalDiscount += effectiveGlobalDiscount; const total = subtotal - totalDiscount + totalTax; return { subtotal, discount: totalDiscount, tax: totalTax, total: Math.max(0, total) }; }
export function calculateRemainingBalance(totalSubunits: number, amountPaidSubunits: number): number { return Math.max(0, totalSubunits - amountPaidSubunits); }
export function calculatePaymentStatus(totalSubunits: number, amountPaidSubunits: number): "unpaid" | "partial" | "paid" | "overpaid" { if (amountPaidSubunits === 0) return "unpaid"; if (amountPaidSubunits < totalSubunits) return "partial"; if (amountPaidSubunits === totalSubunits) return "paid"; return "overpaid"; }
export function determineInvoiceStatus(totalSubunits: number, amountPaidSubunits: number, currentStatus: string): string { if (currentStatus === "cancelled" || currentStatus === "refunded") return currentStatus; if (currentStatus === "draft") return "draft"; const paymentStatus = calculatePaymentStatus(totalSubunits, amountPaidSubunits); switch (paymentStatus) { case "paid": return "paid"; case "partial": return "partial"; case "unpaid": return currentStatus === "issued" ? "issued" : "draft"; default: return currentStatus; } }
export function validateInvoiceItems(items: CalculateInvoiceInput["items"]): { valid: boolean; errors: string[] } { const errors: string[] = []; if (!items || items.length === 0) { errors.push("Invoice must have at least one item"); return { valid: false, errors }; } items.forEach((item, index) => { if (item.quantity <= 0) errors.push(`Item ${index + 1}: Quantity must be positive`); if (item.unitPriceSubunits < 0) errors.push(`Item ${index + 1}: Unit price cannot be negative`); if ((item.discountPercent ?? 0) < 0 || (item.discountPercent ?? 0) > 100) errors.push(`Item ${index + 1}: Discount percent must be between 0 and 100`); if ((item.discountAmountSubunits ?? 0) < 0) errors.push(`Item ${index + 1}: Discount amount cannot be negative`); }); return { valid: errors.length === 0, errors }; }
export function roundToSubunits(value: number): number { return Math.round(value); }
