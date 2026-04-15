"use client";

import { useEffect } from "react";

/** Syncs `dark` class on `<html>` with `prefers-color-scheme` so Tailwind `dark:` works app-wide. */
export function ThemeSync() {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.classList.toggle("dark", mq.matches);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return null;
}
