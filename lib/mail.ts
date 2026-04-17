import nodemailer from "nodemailer";
import { getClientBaseUrl } from "@/lib/client-url";

function hasSmtpConfig(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.EMAIL_FROM,
  );
}

export async function sendPasswordResetEmail(
  to: string,
  token: string,
): Promise<void> {
  const base = getClientBaseUrl();
  const link = `${base}/reset-password?token=${encodeURIComponent(token)}`;
  const subject = "Reset your FinTrack password";

  if (!hasSmtpConfig()) {
    if (process.env.NODE_ENV === "development") {
      console.info("[auth] Password reset link (SMTP not configured):", link);
    }
    return;
  }

  const port = Number(process.env.SMTP_PORT);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text: `Reset your password using this link (expires soon):\n\n${link}\n`,
    html: `<p>Reset your password using the link below (it expires soon).</p><p><a href="${link}">Reset password</a></p>`,
  });
}
