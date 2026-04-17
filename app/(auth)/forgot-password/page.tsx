"use client";

import {
  AuthCard,
  AuthFooter,
  AuthLogo,
  FieldError,
} from "@/components/auth/auth-ui";
import { AuthTextField } from "@/components/auth/form-fields";
import { isEmail } from "@/lib/auth-validation";
import { clearError, clearForgotMessage } from "@/store/auth/auth.slice";
import { forgotPassword } from "@/store/auth/auth.thunk";
import { useAppDispatch } from "@/store/hooks";
import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function ForgotPasswordPage() {
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    setEmailErr(null);
    dispatch(clearError());
    if (!email.trim()) {
      setEmailErr("Email is required");
      return false;
    }
    if (!isEmail(email.trim())) {
      setEmailErr("Enter a valid email address");
      return false;
    }
    return true;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    dispatch(clearForgotMessage());
    dispatch(clearError());
    try {
      await dispatch(forgotPassword({ email: email.trim() })).unwrap();
      setEmail("");
    } catch {
      /* rejected; toast from thunk */
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{ background: "var(--auth-bg)" }}
    >
      <AuthLogo />
      <AuthCard>
        <h1 className="sr-only">Reset password</h1>
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
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <AuthTextField
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="alex@example.com"
              value={email}
              onChange={(v) => {
                setEmail(v);
                setEmailErr(null);
                dispatch(clearError());
              }}
              error={emailErr}
              icon="mail"
            />
            <FieldError message={emailErr} />
          </div>

          <button
            type="submit"
            className="auth-btn-primary"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="auth-spinner" aria-hidden />
                <span className="sr-only">Sending</span>
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>
        <AuthFooter />
      </AuthCard>
    </div>
  );
}
