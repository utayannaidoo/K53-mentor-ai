import {
  Gauge,
  Ruler,
  Scale,
  ShieldAlert,
  Signpost,
  SquareParking,
  TrafficCone,
  type LucideIcon,
} from "lucide-react";
import type { CategoryId } from "@/types";
import { cn } from "@/lib/utils";

const ICONS: Record<CategoryId, LucideIcon> = {
  signs: Signpost,
  rules: Scale,
  controls: Gauge,
  intersections: TrafficCone,
  parking: SquareParking,
  following_distance: Ruler,
  hazard_awareness: ShieldAlert,
};

export function CategoryIcon({
  id,
  className,
}: {
  id: CategoryId;
  className?: string;
}) {
  const Icon = ICONS[id] ?? Signpost;
  return <Icon className={cn("h-4 w-4", className)} />;
}
