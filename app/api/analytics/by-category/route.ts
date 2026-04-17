import { buildByCategoryBreakdown } from "@/lib/analytics/build-analytics-series";
import { monthUtcRange } from "@/lib/analytics/month-range";
import { currentMonthYmLocal } from "@/lib/analytics/months";
import { requireAuthUser } from "@/lib/api/require-auth-user";
import { connectDB } from "@/lib/mongodb";
import { v1Err } from "@/lib/api/v1-response";
import { NextResponse } from "next/server";

function parseYmd(s: string | null): Date | null {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

function endExclusiveYmd(s: string | null): Date | null {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1, 0, 0, 0, 0));
}

export async function GET(request: Request) {
  try {
    const auth = await requireAuthUser(request);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const typeRaw = searchParams.get("type")?.toLowerCase();
    const type: "income" | "expense" =
      typeRaw === "income" ? "income" : "expense";

    const month = searchParams.get("month")?.trim();
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let start: Date;
    let end: Date;

    if (month) {
      const range = monthUtcRange(month);
      if (!range) {
        return v1Err("Invalid month. Use YYYY-MM.", 400, "VALIDATION_ERROR", "month");
      }
      start = range.start;
      end = range.end;
    } else if (startDate && endDate) {
      const s = parseYmd(startDate);
      const e = endExclusiveYmd(endDate);
      if (!s || !e || e <= s) {
        return v1Err("Invalid startDate or endDate.", 400, "VALIDATION_ERROR");
      }
      start = s;
      end = e;
    } else {
      const ym = currentMonthYmLocal();
      const range = monthUtcRange(ym)!;
      start = range.start;
      end = range.end;
    }

    await connectDB();
    const { rows, total } = await buildByCategoryBreakdown(auth.userId, type, start, end);

    const body =
      type === "expense"
        ? { success: true as const, data: rows, totalExpense: total }
        : { success: true as const, data: rows, totalIncome: total };

    return NextResponse.json(body);
  } catch (e) {
    console.error(e);
    return v1Err("Something went wrong", 500, "INTERNAL_ERROR");
  }
}
