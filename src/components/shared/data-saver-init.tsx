"use client";

import { useEffect } from "react";
import { applyDataSaver } from "@/hooks/use-data-saver";

/** Re-applies the saved data-saver preference on each full load. */
export function DataSaverInit() {
  useEffect(() => {
    applyDataSaver(typeof window !== "undefined" && window.localStorage.getItem("k53.dataSaver") === "1");
  }, []);
  return null;
}
