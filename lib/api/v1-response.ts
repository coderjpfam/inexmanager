import { NextResponse } from "next/server";

export function v1Ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true as const, data }, { status });
}

export function v1Err(
  message: string,
  status: number,
  code = "ERROR",
  field?: string,
) {
  return NextResponse.json(
    {
      success: false as const,
      error: { code, message, ...(field ? { field } : {}) },
    },
    { status },
  );
}
