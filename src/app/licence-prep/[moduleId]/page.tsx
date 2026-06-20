"use client";

import { useParams } from "next/navigation";
import { ModuleCookMode } from "@/components/driver/module-cook-mode";

export default function ModulePage() {
  const params = useParams<{ moduleId: string }>();
  return <ModuleCookMode moduleId={String(params.moduleId)} />;
}
