import { buildMonthlyAnalytics } from "@/lib/analytics/build-analytics-series";
import { requireAuthUser } from "@/lib/api/require-auth-user";
import { connectDB } from "@/lib/mongodb";
import { v1Err, v1Ok } from "@/lib/api/v1-response";

function clampMonths(raw: string | null): number {
  const n = raw ? Number.parseInt(raw, 10) : 6;
  if (!Number.isFinite(n)) return 6;
  return Math.min(24, Math.max(1, n));
}

export async function GET(request: Request) {
  try {
    const auth = await requireAuthUser(request);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const months = clampMonths(searchParams.get("months"));

    await connectDB();
    const data = await buildMonthlyAnalytics(auth.userId, months);
    return v1Ok(data);
  } catch (e) {
    console.error(e);
    return v1Err("Something went wrong", 500, "INTERNAL_ERROR");
  }
}
