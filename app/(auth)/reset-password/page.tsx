import { Suspense } from "react";
import { ResetPasswordForm } from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
          style={{ background: "var(--auth-bg)" }}
        >
          <div className="text-sm" style={{ color: "var(--auth-muted)" }}>
            Loading…
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
