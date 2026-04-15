"use client";

import {
  measurePasswordStrength,
  strengthMeta,
} from "@/lib/auth-validation";
import { useId, useState, type ReactNode } from "react";

const eyeOpen = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const eyeClosed = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
    />
  </svg>
);

const mailIcon = (
  <span className="auth-field-icon-left">
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  </span>
);

const userIcon = (
  <span className="auth-field-icon-left">
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  </span>
);

type TextFieldProps = {
  id?: string;
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error: string | null;
  icon: "mail" | "user";
};

export function AuthTextField({
  id: idProp,
  label,
  type = "text",
  autoComplete,
  placeholder,
  value,
  onChange,
  error,
  icon,
}: TextFieldProps) {
  const gen = useId();
  const id = idProp ?? gen;
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-semibold"
        style={{ color: "var(--auth-muted)" }}
      >
        {label}
      </label>
      <div className="auth-field-wrap">
        {icon === "mail" ? mailIcon : userIcon}
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          className={`auth-has-icon-left ${error ? "auth-input-error" : ""}`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

type PasswordFieldProps = {
  id?: string;
  label: ReactNode;
  autoComplete?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error: string | null;
  showStrength?: boolean;
};

export function AuthPasswordField({
  id: idProp,
  label,
  autoComplete,
  placeholder,
  value,
  onChange,
  error,
  showStrength,
}: PasswordFieldProps) {
  const gen = useId();
  const id = idProp ?? gen;
  const [visible, setVisible] = useState(false);
  const strength = measurePasswordStrength(value);
  const meta = strengthMeta(strength.score);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        {typeof label === "string" ? (
          <label
            htmlFor={id}
            className="text-xs font-semibold"
            style={{ color: "var(--auth-muted)" }}
          >
            {label}
          </label>
        ) : (
          label
        )}
      </div>
      <div className="auth-field-wrap">
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          className={error ? "auth-input-error" : ""}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className="auth-field-icon"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? eyeClosed : eyeOpen}
        </button>
      </div>
      {showStrength && value.length > 0 && (
        <div className="mt-2 space-y-1.5">
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="auth-strength-bar flex-1">
                <div
                  className="auth-strength-fill"
                  style={{
                    width: meta.fills[i] ? "100%" : "0%",
                    background: meta.fills[i] ? meta.color : "transparent",
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs" style={{ color: meta.color }}>
              {meta.label}
            </span>
            <div
              className="flex flex-wrap justify-end gap-3 text-xs"
              style={{ color: "var(--auth-muted)" }}
            >
              <span
                className="flex items-center gap-1"
                style={{
                  color: strength.hasLen ? "#00c896" : "var(--auth-muted)",
                }}
              >
                {strength.hasLen ? "✓" : "○"} 8+ chars
              </span>
              <span
                className="flex items-center gap-1"
                style={{
                  color: strength.hasUpper ? "#00c896" : "var(--auth-muted)",
                }}
              >
                {strength.hasUpper ? "✓" : "○"} Uppercase
              </span>
              <span
                className="flex items-center gap-1"
                style={{
                  color: strength.hasNum ? "#00c896" : "var(--auth-muted)",
                }}
              >
                {strength.hasNum ? "✓" : "○"} Number
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type CheckboxProps = {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
};

export function AuthCheckbox({ checked, onChange, children }: CheckboxProps) {
  return (
    <label className="flex cursor-pointer select-none items-start gap-2.5">
      <button
        type="button"
        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors"
        style={{
          borderWidth: 1.5,
          borderColor: checked ? "#00c896" : "var(--auth-border)",
          background: checked ? "#00c896" : "transparent",
        }}
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
      >
        {checked && (
          <svg
            className="h-2.5 w-2.5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </button>
      <span
        className="text-xs leading-relaxed"
        style={{ color: "var(--auth-muted)" }}
      >
        {children}
      </span>
    </label>
  );
}

export function AuthRememberCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-2.5">
      <button
        type="button"
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors"
        style={{
          borderWidth: 1.5,
          borderColor: checked ? "#00c896" : "var(--auth-border)",
          background: checked ? "#00c896" : "transparent",
        }}
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
      >
        {checked && (
          <svg
            className="h-2.5 w-2.5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </button>
      <span className="text-xs font-medium" style={{ color: "var(--auth-muted)" }}>
        Remember me for 30 days
      </span>
    </label>
  );
}
