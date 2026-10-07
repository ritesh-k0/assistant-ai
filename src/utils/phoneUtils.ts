/**
 * Phone number normalization and contact identification utilities
 * Single source of truth for comparing phone numbers dynamically without hardcoding.
 */

/**
 * Normalizes a phone number for consistent comparison.
 * Handles Indian phone formatting (+91, leading 0, 91 prefix, spaces, dashes, parentheses).
 *
 * Examples:
 * - "+91 6207585617" -> "6207585617"
 * - "+916207585617"  -> "6207585617"
 * - "6207585617"     -> "6207585617"
 * - "62075-85617"    -> "6207585617"
 * - "62075 85617"    -> "6207585617"
 * - "06207585617"    -> "6207585617"
 * - "916207585617"   -> "6207585617"
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';

  // 1. Remove all spaces, hyphens, brackets, dots
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '').trim();

  // 2. Strip leading international dial prefixes
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('0091')) {
    cleaned = cleaned.substring(4);
  } else if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // 3. Strip standard Indian 0-trunk prefix for 10-digit mobile numbers (e.g. 06207585617 -> 6207585617)
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.substring(1);
  }

  // 4. Strip leading 91 country code when 12 digits (e.g. 916207585617 -> 6207585617)
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    cleaned = cleaned.substring(2);
  }

  return cleaned;
}

/**
 * Compares two phone numbers to verify if they match.
 * Uses normalized digits and 10-digit suffix matching to prevent false mismatches.
 */
export function arePhoneNumbersEqual(phone1: string, phone2: string): boolean {
  if (!phone1 || !phone2) return false;
  const n1 = normalizePhoneNumber(phone1);
  const n2 = normalizePhoneNumber(phone2);
  if (!n1 || !n2) return false;

  // Direct normalized match
  if (n1 === n2) return true;

  // Last 10 digits match for Indian numbers
  if (n1.length >= 10 && n2.length >= 10 && n1.slice(-10) === n2.slice(-10)) {
    return true;
  }

  return false;
}

/**
 * Dynamically looks up a contact in the saved contacts list by incoming phone number.
 * Returns the matched contact or undefined.
 */
export function findContactByPhone<T extends { phoneNumber: string }>(
  contactsList: T[],
  incomingPhone: string
): T | undefined {
  if (!incomingPhone || !contactsList || contactsList.length === 0) return undefined;
  return contactsList.find((c) => arePhoneNumbersEqual(c.phoneNumber, incomingPhone));
}
