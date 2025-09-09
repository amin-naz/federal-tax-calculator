
// src/lib/w2Parser.ts
// Robust W-2 text parser for browser OCR (tesseract.js).
// Tolerates OCR noise, label variants, and optional punctuation/$.

export type W2Fields = Partial<{
  // Core numeric boxes
  wages: number;                        // Box 1
  federal_tax_withheld: number;         // Box 2
  ss_wages: number;                     // Box 3
  ss_tax_withheld: number;              // Box 4
  medicare_wages: number;               // Box 5
  medicare_tax_withheld: number;        // Box 6

  // Common identifiers
  ein: string;                          // Employer Identification Number
  control_number: string;
  employee_ssn: string;

  // Names/addresses (best-effort)
  employer_name: string;
  employer_address: string;
  employee_name: string;
  employee_address: string;

  // State/local rows (best-effort arrays, because there can be multiple lines)
  state_wages: number[];
  state_income_tax: number[];
  locality_name: string[];
  local_wages: number[];
  local_income_tax: number[];
}>;

const toNum = (s?: string | null) =>
  s ? parseFloat(s.replace(/[^0-9.]/g, '')) : NaN;

const cleanText = (t: string) =>
  t.replace(/\r/g, '').replace(/\t/g, ' ').replace(/[“”]/g, '"').replace(/[‘’]/g, "'");

// grab first capture group number after a label within a small window
function followNumber(text: string, label: RegExp, window = 120): number | NaN {
  const m = label.exec(text);
  if (!m) return NaN;
  const start = m.index + m[0].length;
  const slice = text.slice(start, start + window);
  const m2 = slice.match(/\$?\s*([0-9][0-9,.\s]+)/);
  return m2 ? toNum(m2[1]) : NaN;
}

// grab a string (like EIN, control number) on same line or nearby
function followString(text: string, label: RegExp, window = 100): string {
  const m = label.exec(text);
  if (!m) return '';
  const start = m.index + m[0].length;
  const slice = text.slice(start, start + window);
  // EINs often like 12-3456789, SSNs 123-45-6789; control may be alnum
  const s = slice.match(/[A-Z0-9\-]{5,}/i);
  return s ? s[0].trim().replace(/\s+/g, '') : '';
}

// try multiple regex patterns and return the first numeric match
function firstNumberByPatterns(text: string, patterns: RegExp[], window = 140): number | NaN {
  for (const p of patterns) {
    const v = followNumber(text, p, window);
    if (!isNaN(v)) return v;
  }
  return NaN;
}

export function parseW2Text(input: string): W2Fields {
  const text = cleanText(input);

  // --- CORE BOXES (multiple label variants; OCR often drops punctuation or merges words) ---
  const wages = firstNumberByPatterns(text, [
    /Box\s*1\b[^A-Za-z0-9$]{0,10}/i,
    /Wages[, ]+tips[, ]+other[, ]+comp(ensation)?[^0-9$]{0,20}/i,
  ]);

  const federal_tax_withheld = firstNumberByPatterns(text, [
    /Box\s*2\b[^A-Za-z0-9$]{0,10}/i,
    /Federal\s*income\s*tax\s*withheld[^0-9$]{0,20}/i,
  ]);

  const ss_wages = firstNumberByPatterns(text, [
    /Box\s*3\b[^A-Za-z0-9$]{0,10}/i,
    /Social\s*security\s*wages[^0-9$]{0,20}/i,
  ]);

  const ss_tax_withheld = firstNumberByPatterns(text, [
    /Box\s*4\b[^A-Za-z0-9$]{0,10}/i,
    /Social\s*security\s*tax\s*withheld[^0-9$]{0,20}/i,
  ]);

  const medicare_wages = firstNumberByPatterns(text, [
    /Box\s*5\b[^A-Za-z0-9$]{0,10}/i,
    /Medicare\s*wages\s*(and\s*tips)?[^0-9$]{0,20}/i,
  ]);

  const medicare_tax_withheld = firstNumberByPatterns(text, [
    /Box\s*6\b[^A-Za-z0-9$]{0,10}/i,
    /Medicare\s*tax\s*withheld[^0-9$]{0,20}/i,
  ]);

  // --- IDENTIFIERS ---
  // EIN lines may look like: "Employer identification number (EIN) 12-3456789"
  let ein = followString(text, /(Employer\s+identification\s+number|EIN)[:\s]*?/i);
  if (!ein) {
    // try a pattern like "EIN: 12-3456789" anywhere
    const m = text.match(/\bEIN\b[:\s]*([0-9]{2}-[0-9]{7})/i);
    if (m) ein = m[1];
  }

  const control_number =
    followString(text, /(Control\s*number)[:\s]*/i) ||
    (text.match(/Control\s*No\.?[:\s]*([A-Za-z0-9\-]+)/i)?.[1] ?? '');

  const employee_ssn =
    (text.match(/\bEmployee'?s?\s+social\s+security\s+number[:\s]*([0-9X]{3}-[0-9X]{2}-[0-9X]{4})/i)?.[1]) ||
    (text.match(/\bSSN[:\s]*([0-9X]{3}-[0-9X]{2}-[0-9X]{4})/i)?.[1]) ||
    '';

  // --- NAMES & ADDRESSES (best-effort; OCR is noisy) ---
  // Heuristic: capture lines after "Employer's name" label up to a blank line or next label.
  function captureBlock(afterLabel: RegExp, stopAfter = 200): string {
    const m = afterLabel.exec(text);
    if (!m) return '';
    const s = text.slice(m.index + m[0].length, m.index + m[0].length + stopAfter);
    // Cut off at next label-like sequence to avoid swallowing too much
    const cut = s.split(/\n{2,}|\n\s*(Box\s*\d|Employee'?s|Employer|EIN|Control)/i)[0];
    return (cut || '').trim();
  }

  const employer_block =
    captureBlock(/Employer'?s?\s+name.*?:?/i, 300) ||
    captureBlock(/Employer[:\s]+/i, 180);
  const employee_block =
    captureBlock(/Employee'?s?\s+name.*?:?/i, 200) ||
    captureBlock(/Employee[:\s]+/i, 160);

  // Very rough split: first line = name; remaining = address-ish
  const splitNameAddr = (block: string) => {
    if (!block) return { name: '', addr: '' };
    const lines = block.split(/\n/).map(s => s.trim()).filter(Boolean);
    if (!lines.length) return { name: '', addr: '' };
    const name = lines[0];
    const addr = lines.slice(1).join(', ');
    return { name, addr };
  };

  const { name: employer_name, addr: employer_address } = splitNameAddr(employer_block);
  const { name: employee_name, addr: employee_address } = splitNameAddr(employee_block);

  // --- STATE & LOCAL (multiple lines). We scan for rows like:
  // "State wages, tips, etc.  52,000.00   State income tax  1,200.00"
  // "Locality name  CITY  Local wages 50,000.00  Local income tax 300.00"
  const state_wages: number[] = [];
  const state_income_tax: number[] = [];
  const locality_name: string[] = [];
  const local_wages: number[] = [];
  const local_income_tax: number[] = [];

  // Try to parse repeated patterns line-by-line
  const lines = cleanText(input).split(/\n/);

  for (const line of lines) {
    // State row
    const sw = line.match(/State\s*wages[^0-9$]*\$?\s*([0-9,.\s]+)/i);
    if (sw) state_wages.push(toNum(sw[1]));

    const sit = line.match(/State\s*income\s*tax[^0-9$]*\$?\s*([0-9,.\s]+)/i);
    if (sit) state_income_tax.push(toNum(sit[1]));

    // Local row
    const ln = line.match(/Locality\s*name[:\s]*([A-Za-z \-]+)/i);
    if (ln && ln[1].trim()) locality_name.push(ln[1].trim());

    const lw = line.match(/Local\s*wages[^0-9$]*\$?\s*([0-9,.\s]+)/i);
    if (lw) local_wages.push(toNum(lw[1]));

    const lit = line.match(/Local\s*income\s*tax[^0-9$]*\$?\s*([0-9,.\s]+)/i);
    if (lit) local_income_tax.push(toNum(lit[1]));
  }

  const out: W2Fields = {};
  if (!isNaN(wages)) out.wages = wages;
  if (!isNaN(federal_tax_withheld)) out.federal_tax_withheld = federal_tax_withheld;
  if (!isNaN(ss_wages)) out.ss_wages = ss_wages;
  if (!isNaN(ss_tax_withheld)) out.ss_tax_withheld = ss_tax_withheld;
  if (!isNaN(medicare_wages)) out.medicare_wages = medicare_wages;
  if (!isNaN(medicare_tax_withheld)) out.medicare_tax_withheld = medicare_tax_withheld;

  if (ein) out.ein = ein;
  if (control_number) out.control_number = control_number;
  if (employee_ssn) out.employee_ssn = employee_ssn;

  if (employer_name) out.employer_name = employer_name;
  if (employer_address) out.employer_address = employer_address;
  if (employee_name) out.employee_name = employee_name;
  if (employee_address) out.employee_address = employee_address;

  if (state_wages.length) out.state_wages = state_wages;
  if (state_income_tax.length) out.state_income_tax = state_income_tax;
  if (locality_name.length) out.locality_name = locality_name;
  if (local_wages.length) out.local_wages = local_wages;
  if (local_income_tax.length) out.local_income_tax = local_income_tax;

  return out;
}
