import { z } from "zod";

/**
 * A learner's one-line story, asked for at the only moment it is earned: the
 * screen where they tell us they passed.
 *
 * Kept as a pure module so the route's validation can be tested without
 * standing up Supabase, and so the client and server agree on the limits the
 * form enforces.
 */
export const TESTIMONIAL_MAX = 400;
export const TESTIMONIAL_MIN = 15;
export const DISPLAY_NAME_MAX = 40;

export const testimonialSchema = z.object({
  /** What the learner wants to say. */
  quote: z.string().trim().min(TESTIMONIAL_MIN).max(TESTIMONIAL_MAX),
  /** First name (or initials) to publish it under — never the full account name. */
  displayName: z.string().trim().max(DISPLAY_NAME_MAX).optional(),
  /**
   * POPIA: publishing someone's words next to their name is a separate use of
   * their personal information, so it takes its own active opt-in. Literal
   * `true` — an unticked box must fail validation, not default to consent.
   */
  consent: z.literal(true),
  kind: z.enum(["learners", "drivers"]),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;
