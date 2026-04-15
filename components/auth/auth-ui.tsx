import Link from "next/link";
import type { ReactNode } from "react";

export function AuthLogo() {
  return (
    <div className="auth-fade-up mb-8 flex items-center gap-3">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ background: "#00c896" }}
      >
        <svg
          className="h-5 w-5 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <span
        className="text-xl font-bold tracking-tight"
        style={{ color: "var(--auth-text)" }}
      >
        FinTrack
      </span>
    </div>
  );
}

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div
      className="auth-fade-up-delay w-full max-w-sm rounded-2xl p-8"
      style={{
        background: "var(--auth-card)",
        border: "1.5px solid var(--auth-border)",
      }}
    >
      {children}
    </div>
  );
}

export function AuthFooter() {
  return (
    <p
      className="mt-8 text-center text-xs"
      style={{ color: "var(--auth-muted)" }}
    >
      © {new Date().getFullYear()} FinTrack ·{" "}
      <Link href="#" className="font-medium" style={{ color: "#00c896" }}>
        Privacy
      </Link>{" "}
      ·{" "}
      <Link href="#" className="font-medium" style={{ color: "#00c896" }}>
        Terms
      </Link>
    </p>
  );
}

export function FieldError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      className="mt-1.5 flex items-center gap-1 text-[11.5px]"
      style={{ color: "#ff6b6b" }}
    >
      <svg
        className="h-3 w-3 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.07 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
      {message}
    </p>
  );
}

export function ServerErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      className="rounded-xl px-4 py-3 text-sm font-medium"
      style={{
        background: "rgba(255, 107, 107, 0.1)",
        border: "1px solid rgba(255, 107, 107, 0.25)",
        color: "#ff6b6b",
      }}
      role="alert"
    >
      {message}
    </div>
  );
}

export function SuccessBanner({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-xl px-4 py-3 text-sm font-medium"
      style={{
        background: "rgba(0, 200, 150, 0.1)",
        border: "1px solid rgba(0, 200, 150, 0.25)",
        color: "#00a87c",
      }}
    >
      {children}
    </div>
  );
}

const googleIcon = (
  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const appleIcon = (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.04 1.27-2.02 3.46.03 2.67 2.33 3.57 2.36 3.58-.03.08-.37 1.27-1.09 2.52zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

export function SocialSection() {
  return (
    <>
      <div className="auth-divider my-6">or continue with</div>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" className="auth-btn-ghost" title="Coming soon">
          {googleIcon}
          Google
        </button>
        <button type="button" className="auth-btn-ghost" title="Coming soon">
          {appleIcon}
          Apple
        </button>
      </div>
    </>
  );
}
