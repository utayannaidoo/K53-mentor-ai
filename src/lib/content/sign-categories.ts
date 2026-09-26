import type { SignCategory } from "@/types";

/** Library display order + copy for each top-level sign group. */
export const SIGN_CATEGORIES: {
  id: SignCategory;
  label: string;
  blurb: string;
  icon: string;
}[] = [
  {
    id: "regulatory",
    label: "Regulatory",
    blurb: "Orders you must obey — stop, yield, no-entry, speed limits, no-overtaking.",
    icon: "Octagon",
  },
  {
    id: "warning",
    label: "Warning",
    blurb: "Triangular signs that warn of a hazard or change in the road ahead.",
    icon: "TriangleAlert",
  },
  {
    id: "information",
    label: "Information",
    blurb: "Help you read the road ahead and plan your lane use.",
    icon: "Info",
  },
  {
    id: "guidance",
    label: "Guidance",
    blurb: "Point you to routes, destinations, services and tourist attractions.",
    icon: "Signpost",
  },
  {
    id: "marking",
    label: "Road markings",
    blurb: "Lines, arrows and symbols painted on the road surface.",
    icon: "Minus",
  },
];

