"use client";

import * as React from "react";

const KEY = "k53.dataSaver";

export function applyDataSaver(on: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("data-saver", on);
}

/** Data-saver mode — disables decorative backgrounds and looping animations. */
export function useDataSaver(): [boolean, (v: boolean) => void] {
  const [on, setOn] = React.useState(false);

  React.useEffect(() => {
    const v = typeof window !== "undefined" && window.localStorage.getItem(KEY) === "1";
    setOn(v);
    applyDataSaver(v);
  }, []);

  const set = React.useCallback((v: boolean) => {
    setOn(v);
    try {
      window.localStorage.setItem(KEY, v ? "1" : "0");
    } catch {
      /* ignore */
    }
    applyDataSaver(v);
  }, []);

  return [on, set];
}
