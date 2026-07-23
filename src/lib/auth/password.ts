/**
 * Client-side mirror of the Supabase Auth password policy (dashboard →
 * Authentication → Sign In/Providers → Email): minimum length 8, requiring a
 * lowercase letter, an uppercase letter, and a digit.
 *
 * The server remains the enforcing authority — this only lets the signup and
 * password-reset forms give inline feedback before submitting, instead of
 * bouncing off a server-side rejection. Keep these rules in step with the
 * dashboard setting if it ever changes.
 */

export const MIN_PASSWORD_LENGTH = 8;

export interface PasswordRule {
  label: string;
  ok: boolean;
}

export function passwordRules(password: string): PasswordRule[] {
  return [
    { label: `At least ${MIN_PASSWORD_LENGTH} characters`, ok: password.length >= MIN_PASSWORD_LENGTH },
    { label: "A lowercase letter", ok: /[a-z]/.test(password) },
    { label: "An uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "A number", ok: /[0-9]/.test(password) },
  ];
}

export function isPasswordValid(password: string): boolean {
  return passwordRules(password).every((rule) => rule.ok);
}
