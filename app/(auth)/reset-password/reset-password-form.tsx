"use client";

import {
  AuthCard,
  AuthFooter,
  AuthLogo,
  FieldError,
} from "@/components/auth/auth-ui";
import { AuthPasswordField } from "@/components/auth/form-fields";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordErr, setPasswordErr] = useState<string | null>(null);
  const [confirmErr, setConfirmErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    setPasswordErr(null);
    setConfirmErr(null);
    let ok = true;
    if (!password) {
      setPasswordErr("Password is required");
      ok = false;
    } else if (password.length < 8) {
      setPasswordErr("Password must be at least 8 characters");
      ok = false;
    } else if (!/[A-Z]/.test(password)) {
      setPasswordErr("Password needs at least one uppercase letter");
      ok = false;
    } else if (!/[0-9]/.test(password)) {
      setPasswordErr("Password needs at least one number");
      ok = false;
    }
    if (password && confirm !== password) {
      setConfirmErr("Passwords do not match");
      ok = false;
    }
    return ok;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      router.push("/signin");
    }, 1400);
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{ background: "var(--auth-bg)" }}
    >
      <AuthLogo />
      <AuthCard>
        <h1 className="sr-only">Set new password</h1>
        <div className="mb-2">
          <Link
            href="/signin"
            className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: "var(--auth-muted)" }}
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Sign In
          </Link>
        </div>
        <p
          className="mb-6 text-sm leading-relaxed"
          style={{ color: "var(--auth-muted)" }}
        >
          {token
            ? "Choose a new password for your account."
            : "Choose a new password. If you opened this page without an email link, request a new reset from sign in."}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <AuthPasswordField
              label="New password"
              autoComplete="new-password"
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              value={password}
              onChange={(v) => {
                setPassword(v);
                setPasswordErr(null);
              }}
              error={passwordErr}
              showStrength
            />
            <FieldError message={passwordErr} />
          </div>

          <div>
            <AuthPasswordField
              label="Confirm password"
              autoComplete="new-password"
              placeholder="Re-enter password"
              value={confirm}
              onChange={(v) => {
                setConfirm(v);
                setConfirmErr(null);
              }}
              error={confirmErr}
            />
            <FieldError message={confirmErr} />
          </div>

          <button type="submit" className="auth-btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="auth-spinner" aria-hidden />
                <span className="sr-only">Updating password</span>
              </>
            ) : (
              "Update password"
            )}
          </button>
        </form>
        <AuthFooter />
      </AuthCard>
    </div>
  );
}
