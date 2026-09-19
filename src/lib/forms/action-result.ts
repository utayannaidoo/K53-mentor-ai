/**
 * The shape every server action in this codebase returns.
 *
 * Actions return a result rather than throwing, so the outcome — including
 * "not permitted" — renders in place instead of becoming an error page. See
 * `src/components/admin/action-form.tsx` for the wrapper that displays it.
 *
 * This lives in lib rather than beside any one set of actions because both the
 * admin area and the school workspace use it, and a shared component should
 * not import a type from an app route module.
 */
export interface ActionResult {
  ok: boolean;
  message: string;
}
