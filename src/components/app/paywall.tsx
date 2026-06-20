import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Paywall({
  title,
  description,
  cta = "See plans",
  href = "/account/billing",
  icon,
}: {
  title: string;
  description: string;
  cta?: string;
  href?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card className="mx-auto max-w-md p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon ?? <Lock className="h-6 w-6" />}
      </div>
      <h2 className="mt-5 font-display text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <Link href={href} className={cn(buttonVariants({ size: "lg" }), "mt-6 w-full gap-2")}>
        <Sparkles className="h-4 w-4" /> {cta}
      </Link>
    </Card>
  );
}
