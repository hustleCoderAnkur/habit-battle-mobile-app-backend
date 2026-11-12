/**
 * Phone helpers.
 *
 * Numbers are stored as digits only (country code optional), e.g.
 *   "+91 98765-43210"  ->  "919876543210"
 *   "098765 43210"     ->  "09876543210"
 *
 * Matching uses the LAST 10 digits so "+91 98765 43210" (a contact)
 * matches "9876543210" (typed at signup).
 */

export function normalizePhone(raw: string): string | null {
    let digits = raw.replace(/\D/g, "");

    if (digits.startsWith("00")) digits = digits.slice(2);

    if (digits.length < 8 || digits.length > 15) return null;

    return digits;
}

/** key used for matching: last 10 digits (or the whole number if shorter) */
export function phoneKey(digits: string): string {
    return digits.slice(-10);
}
