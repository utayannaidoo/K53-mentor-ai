import { redirect } from "next/navigation";

// The starting check was removed: onboarding now asks what the learner finds
// hard and starts them studying. Old links and emails land on practice instead.
export default function Page() {
  redirect("/study/questions");
}
