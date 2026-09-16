export const SCHOOL_STORAGE_KEY = "k53.school";
export function normaliseSchoolCode(value: string): string { return value.trim().toLowerCase(); }
export function validSchoolCode(value: string): boolean { return /^[a-z0-9-]{6,16}$/.test(normaliseSchoolCode(value)); }
export function schoolClaimMessage(name: string): string {
  return `You're credited to ${name}. They earn R20 if you subscribe, and you've got 14 days free instead of 7, plus 250 CP.`;
}
