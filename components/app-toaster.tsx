"use client";

import { Toaster } from "react-hot-toast";

const ACCENT = "#00c896";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={10}
      containerStyle={{
        top: 16,
        right: 16,
      }}
      toastOptions={{
        duration: 4500,
        style: {
          borderRadius: "12px",
          padding: "12px 16px",
          fontSize: "13px",
          fontWeight: 600,
          maxWidth: "min(100vw - 32px, 360px)",
        },
        success: {
          duration: 4000,
          iconTheme: {
            primary: ACCENT,
            secondary: "#ffffff",
          },
          style: {
            background: "#0f172a",
            color: "#f1f5f9",
            border: `1px solid ${ACCENT}`,
            boxShadow: "0 12px 40px rgba(15, 23, 42, 0.25)",
          },
        },
        error: {
          duration: 5500,
          iconTheme: {
            primary: "#ff6b6b",
            secondary: "#ffffff",
          },
          style: {
            background: "#1e1b2e",
            color: "#fecdd3",
            border: "1px solid rgba(255, 107, 107, 0.4)",
            boxShadow: "0 12px 40px rgba(15, 23, 42, 0.2)",
          },
        },
        loading: {
          style: {
            background: "#0f172a",
            color: "#e2e8f0",
            border: "1px solid rgba(148, 163, 184, 0.35)",
          },
        },
      }}
    />
  );
}
