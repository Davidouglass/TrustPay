// Interim bank list (CBN codes). Replaced by Kora's live bank list when payments are integrated.
export const BANKS = [
  ['044', 'Access Bank'], ['011', 'First Bank of Nigeria'], ['058', 'Guaranty Trust Bank (GTBank)'], ['033', 'United Bank for Africa (UBA)'],
  ['057', 'Zenith Bank'], ['070', 'Fidelity Bank'], ['214', 'First City Monument Bank (FCMB)'], ['232', 'Sterling Bank'],
  ['032', 'Union Bank'], ['035', 'Wema Bank'], ['221', 'Stanbic IBTC Bank'], ['076', 'Polaris Bank'], ['050', 'Ecobank Nigeria'], ['082', 'Keystone Bank'],
] as const;

export type BankInput = { bankCode: string; accountNumber: string; accountName: string };
export type BankResult = { error: string } | { ok: { bankCode: string; bankName: string; accountNumber: string; accountName: string } };

/** Pure validation, shared by the server action (authoritative) and tests. */
export function validateBank(input: BankInput): BankResult {
  const bank = BANKS.find(([code]) => code === input.bankCode);
  if (!bank) return { error: 'Choose your bank from the list.' };
  const accountNumber = input.accountNumber.trim();
  if (!/^\d{10}$/.test(accountNumber)) return { error: 'Account number must be exactly 10 digits.' };
  const accountName = input.accountName.trim().replace(/\s+/g, ' ');
  if (!/^[A-Za-z][A-Za-z .'-]{2,99}$/.test(accountName)) return { error: 'Enter the account name exactly as your bank shows it (letters only).' };
  return { ok: { bankCode: bank[0], bankName: bank[1], accountNumber, accountName } };
}
