
export type Slab = { rate: number; upTo?: number | null };

export const BRACKETS_SINGLE_2025: Slab[] = [
  { rate: 0.10, upTo: 11925 },
  { rate: 0.12, upTo: 48475 },
  { rate: 0.22, upTo: 103350 },
  { rate: 0.24, upTo: 197300 },
  { rate: 0.32, upTo: 250525 },
  { rate: 0.35, upTo: 626350 },
  { rate: 0.37, upTo: null }, // no cap
];

export function taxFromTaxable(taxable: number, slabs = BRACKETS_SINGLE_2025) {
  let remaining = Math.max(0, taxable);
  let prev = 0, tax = 0;
  const breakdown: { label: string; amount: number }[] = [];

  for (const s of slabs) {
    const cap = s.upTo == null ? Infinity : s.upTo;
    const slabAmt = Math.max(0, Math.min(remaining, cap - prev));
    if (slabAmt > 0) {
      const slabTax = slabAmt * s.rate;
      tax += slabTax;
      breakdown.push({ label: `${Math.round(s.rate*100)}% on $${slabAmt.toFixed(2)}`, amount: +slabTax.toFixed(2) });
      remaining -= slabAmt;
    }
    prev = cap;
    if (remaining <= 0) break;
  }
  return { tax: +tax.toFixed(2), breakdown };
}

export const effectiveRate = (tax: number, agi: number) =>
  agi > 0 ? +(tax / agi).toFixed(4) : 0;
