"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      // "system", not "light": enableSystem only takes effect when the resolved
      // theme is "system", so a "light" default meant a first-time visitor whose
      // phone is in dark mode still got the cream theme — while the dark
      // theme-color meta turned their browser chrome dark. Cream page, dark
      // chrome, no way to fix it on mobile.
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
