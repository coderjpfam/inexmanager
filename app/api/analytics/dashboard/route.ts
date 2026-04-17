import { buildDashboardPayload } from "@/lib/analytics/build-dashboard";
import { requireAuthUser } from "@/lib/api/require-auth-user";
import { currentMonthYm, parseMonthYm } from "@/lib/analytics/month-range";
import { connectDB } from "@/lib/mongodb";
import { v1Err, v1Ok } from "@/lib/api/v1-response";

export async function GET(request: Request) {
  try {
    const auth = await requireAuthUser(request);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const rawMonth = searchParams.get("month")?.trim();
    const month = rawMonth && parseMonthYm(rawMonth) ? rawMonth : currentMonthYm();

    await connectDB();
    const result = await buildDashboardPayload(auth.userId, month);
    if ("error" in result) {
      return v1Err(result.error, 400, "VALIDATION_ERROR", "month");
    }

    return v1Ok(result);
  } catch (e) {
    console.error(e);
    return v1Err("Something went wrong", 500, "INTERNAL_ERROR");
  }
}
