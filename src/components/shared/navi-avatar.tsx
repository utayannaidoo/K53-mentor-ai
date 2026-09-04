import Image from "next/image";
import { cn } from "@/lib/utils";

/** The named companion behind the learner-facing tutor experience. */
export function NaviAvatar({
  className,
  decorative = false,
  priority = false,
}: {
  className?: string;
  /** Assistant-message labels already name Navi, so avoid repeated announcements. */
  decorative?: boolean;
  priority?: boolean;
}) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)} aria-hidden={decorative || undefined}>
      <Image
        src="/mascots/navi.png"
        alt={decorative ? "" : "Navi, your K53 driving tutor"}
        fill
        sizes="(max-width: 640px) 64px, 96px"
        priority={priority}
        className="object-contain"
      />
    </span>
  );
}
