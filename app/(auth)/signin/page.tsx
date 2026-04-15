"use client";

import {
  AuthCard,
  AuthFooter,
  AuthLogo,
  FieldError,
  ServerErrorBanner,
  SocialSection,
} from "@/components/auth/auth-ui";
import {
  AuthPasswordField,
  AuthRememberCheckbox,
  AuthTextField,
} from "@/components/auth/form-fields";
import { isEmail } from "@/lib/auth-validation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [passwordErr, setPasswordErr] = useState<string | null>(null);
  const [serverErr, setServerErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    setEmailErr(null);
    setPasswordErr(null);
    setServerErr(null);
    let ok = true;
    if (!email.trim()) {
      setEmailErr("Email is required");
      ok = false;
    } else if (!isEmail(email.trim())) {
      setEmailErr("Enter a valid email address");
      ok = false;
    }
    if (!password) {
      setPasswordErr("Password is required");
      ok = false;
    } else if (password.length < 6) {
      setPasswordErr("Password must be at least 6 characters");
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
      if (email.trim() === "wrong@test.com") {
        setServerErr("Incorrect email or password. Please try again.");
        return;
      }
      try {
        localStorage.setItem("fintrack-remember", remember ? "1" : "0");
      } catch {
        /* ignore quota / private mode */
      }
      router.push("/dashboard");
    }, 1600);
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{ background: "var(--auth-bg)" }}
    >
      <AuthLogo />
      <AuthCard>
        <h1 className="sr-only">Sign in</h1>
        <p
          className="mb-6 text-center text-sm"
          style={{ color: "var(--auth-muted)" }}
        >
          Welcome back. Sign in to continue.
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
                setServerErr(null);
              }}
              error={emailErr}
              icon="mail"
            />
            <FieldError message={emailErr} />
          </div>

          <div>
            <AuthPasswordField
              id="signin-password"
              label={
                <>
                  <label
                    htmlFor="signin-password"
                    className="text-xs font-semibold"
                    style={{ color: "var(--auth-muted)" }}
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold"
                    style={{ color: "#00c896" }}
                  >
                    Forgot password?
                  </Link>
                </>
              }
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(v) => {
                setPassword(v);
                setPasswordErr(null);
                setServerErr(null);
              }}
              error={passwordErr}
            />
            <FieldError message={passwordErr} />
          </div>

          <AuthRememberCheckbox checked={remember} onChange={setRemember} />

          {serverErr && (
            <div className="mt-2">
              <ServerErrorBanner message={serverErr} />
            </div>
          )}

          <button type="submit" className="auth-btn-primary mt-2" disabled={loading}>
            {loading ? (
              <>
                <span className="auth-spinner" aria-hidden />
                <span className="sr-only">Signing in</span>
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <SocialSection />

        <p
          className="mt-6 text-center text-xs"
          style={{ color: "var(--auth-muted)" }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold"
            style={{ color: "#00c896" }}
          >
            Create account
          </Link>
        </p>

        <AuthFooter />
      </AuthCard>
    </div>
  );
}
