export function getClientBaseUrl(): string {
  const explicit =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  return "http://localhost:3000";
}
