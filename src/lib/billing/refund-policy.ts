/**
 * Public money-back contract.
 *
 * This module deliberately has no server or React dependencies: billing
 * enforcement and every surface that promises a refund import the same
 * values. Changing the policy is therefore one reviewed change instead of a
 * search-and-replace across purchase, account, FAQ and legal copy.
 */
export const MONEY_BACK_DAYS = 7;

/** Honest upper bound quoted while an automatic refund waits for retry. */
export const REFUND_PROCESSING_DAYS = 2;

/** The exact event that starts the automatic-refund window. */
export const REFUND_WINDOW_PHRASE =
  `within ${MONEY_BACK_DAYS} days of your most recent subscription payment`;

/** Short label used on purchase surfaces. */
export const REFUND_GUARANTEE_LABEL = `${MONEY_BACK_DAYS}-day money-back guarantee`;

/** The server latches this after one successful automatic refund. */
export const REFUND_REDEMPTION_LIMIT = "once per subscription";
