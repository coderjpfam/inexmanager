import { NextResponse } from "next/server";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, message }, { status });
}

export function jsonOk<T extends Record<string, unknown>>(body: T, status = 200) {
  return NextResponse.json({ ok: true, ...body }, { status });
}

export function readEmail(body: Record<string, unknown>): string | undefined {
  const v = body.email ?? body.emailId;
  return typeof v === "string" ? v.trim().toLowerCase() : undefined;
}
