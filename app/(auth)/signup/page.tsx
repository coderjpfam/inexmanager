"use client";

import {
  AuthCard,
  AuthFooter,
  AuthLogo,
  FieldError,
  SocialSection,
} from "@/components/auth/auth-ui";
import {
  AuthCheckbox,
  AuthPasswordField,
  AuthTextField,
} from "@/components/auth/form-fields";
import { isEmail } from "@/lib/auth-validation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [nameErr, setNameErr] = useState<string | null>(null);
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [passwordErr, setPasswordErr] = useState<string | null>(null);
  const [confirmErr, setConfirmErr] = useState<string | null>(null);
  const [termsErr, setTermsErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function clearFieldErrors() {
    setNameErr(null);
    setEmailErr(null);
    setPasswordErr(null);
    setConfirmErr(null);
    setTermsErr(null);
  }

  function validate(): boolean {
    clearFieldErrors();
    let ok = true;
    if (!name.trim()) {
      setNameErr("Full name is required");
      ok = false;
    }
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
    if (!agreed) {
      setTermsErr("Please accept the Terms of Service to continue");
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
    }, 1800);
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{ background: "var(--auth-bg)" }}
    >
      <AuthLogo />
      <AuthCard>
        <h1 className="sr-only">Create account</h1>
        <p
          className="mb-6 text-center text-sm"
          style={{ color: "var(--auth-muted)" }}
        >
          Create your FinTrack account.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <AuthTextField
              label="Full name"
              type="text"
              autoComplete="name"
              placeholder="Alex Kumar"
              value={name}
              onChange={(v) => {
                setName(v);
                setNameErr(null);
              }}
              error={nameErr}
              icon="user"
            />
            <FieldError message={nameErr} />
          </div>

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
              }}
              error={emailErr}
              icon="mail"
            />
            <FieldError message={emailErr} />
          </div>

          <div>
            <AuthPasswordField
              label="Password"
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

          <div>
            <AuthCheckbox checked={agreed} onChange={setAgreed}>
              I agree to the{" "}
              <Link href="#" className="font-semibold" style={{ color: "#00c896" }}>
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="font-semibold" style={{ color: "#00c896" }}>
                Privacy Policy
              </Link>
            </AuthCheckbox>
            <FieldError message={termsErr} />
          </div>

          <button type="submit" className="auth-btn-primary mt-2" disabled={loading}>
            {loading ? (
              <>
                <span className="auth-spinner" aria-hidden />
                <span className="sr-only">Creating account</span>
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <SocialSection />

        <p
          className="mt-6 text-center text-xs"
          style={{ color: "var(--auth-muted)" }}
        >
          Already have an account?{" "}
          <Link
            href="/signin"
            className="font-semibold"
            style={{ color: "#00c896" }}
          >
            Sign in
          </Link>
        </p>

        <AuthFooter />
      </AuthCard>
    </div>
  );
}
