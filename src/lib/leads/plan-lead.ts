import { z } from "zod";
import type { CategoryId, VehicleCode } from "@/types";

/**
 * "Email me my plan" — the one thing a visitor who finished the starting check
 * but won't create an account can still do.
 *
 * Shared by the form and the route so both enforce the same limits, and pure
 * (no node/crypto, no Supabase) so it can be unit-tested on its own.
 */

export const LEAD_EMAIL_MAX = 200;

const CATEGORY_IDS = [
  "signs",
  "rules",
  "controls",
  "intersections",
  "parking",
  "following_distance",
  "hazard_awareness",
] as const satisfies readonly CategoryId[];

const VEHICLE_CODES = ["8", "10", "14", "A1", "A"] as const satisfies readonly VehicleCode[];

export const planLeadSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(LEAD_EMAIL_MAX),
  /**
   * POPIA section 69: an email we send because someone asked for it is fine,
   * but the address is still personal information and the tick is what makes
   * keeping it lawful. Literal `true` — an unticked box must fail validation,
   * never default to consent.
   */
  consent: z.literal(true),
  /** The starting check's raw result, as shown on the results screen. */
  score: z.number().int().min(0).max(100),
  correct: z.number().int().min(0).max(200),
  total: z.number().int().min(1).max(200),
  weakCategories: z.array(z.enum(CATEGORY_IDS)).max(CATEGORY_IDS.length),
  vehicleCode: z.enum(VEHICLE_CODES),
});

export type PlanLeadInput = z.infer<typeof planLeadSchema>;
