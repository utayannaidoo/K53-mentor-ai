/**
 * Where the learner's study state lives in localStorage.
 *
 * Its own leaf module so the marketing pages can read the "is anyone signed in
 * on this browser" signal without importing `local-store`, which pulls in
 * @/lib/engagement and @/lib/diagnostic/scoring — and through them the whole
 * question bank. Keeping that out of the landing chunk is the same reason
 * StudyStoreProvider is not mounted at the root layout.
 */
export const STORAGE_KEY = "k53mentor.state.v1";
