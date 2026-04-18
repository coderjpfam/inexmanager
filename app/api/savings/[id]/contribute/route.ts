import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/api/require-auth-user";
import { connectDB } from "@/lib/mongodb";
import { v1Err } from "@/lib/api/v1-response";
import { deriveSavingMetrics } from "@/lib/savings/metrics";
import { contributionToJson } from "@/lib/savings/serialize";
import { SavingGoalModel } from "@/models/SavingGoal";
import mongoose from "mongoose";

type RouteCtx = { params: Promise<{ id: string }> };

function parseYmd(s: unknown): Date | null {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

/** POST /api/savings/:id/contribute — add contribution (references/api.md § Savings). */
export async function POST(request: Request, ctx: RouteCtx) {
  try {
    const auth = await requireAuthUser(request);
    if (!auth.ok) return auth.response;

    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) {
      return v1Err("Not found", 404, "NOT_FOUND");
    }

    const body = (await request.json()) as Record<string, unknown>;
    const amount = body.amount;
    const date = parseYmd(body.date);
    const note = typeof body.note === "string" ? body.note.trim() : undefined;

    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
      return v1Err("amount must be a positive number", 400, "VALIDATION", "amount");
    }
    if (!date) {
      return v1Err("date is required (YYYY-MM-DD)", 400, "VALIDATION", "date");
    }

    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);
    const g = await SavingGoalModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: uid,
    });
    if (!g) return v1Err("Not found", 404, "NOT_FOUND");

    if (g.status === "Completed") {
      return v1Err("Goal is already completed", 400, "VALIDATION");
    }

    const prevSaved = g.savedAmount ?? 0;
    const target = g.targetAmount ?? 0;
    const room = target > 0 ? Math.max(0, target - prevSaved) : Number.POSITIVE_INFINITY;
    const applied = Number.isFinite(room) ? Math.min(amount, room) : amount;
    if (applied <= 0) {
      return v1Err("Target already reached", 400, "VALIDATION");
    }

    g.contributions = g.contributions ?? [];
    g.contributions.push({ amount: applied, date, note });
    g.savedAmount = prevSaved + applied;

    if (target > 0 && g.savedAmount >= target) {
      g.savedAmount = target;
      g.status = "Completed";
    }

    await g.save();

    const m = deriveSavingMetrics(g.targetAmount, g.savedAmount, g.targetDate ?? undefined);
    const last = g.contributions[g.contributions.length - 1]!;

    return NextResponse.json({
      success: true as const,
      data: {
        _id: String(g._id),
        savedAmount: g.savedAmount,
        percentageComplete: m.percentageComplete,
        status: g.status,
        lastContribution: contributionToJson(last),
      },
    });
  } catch (e) {
    console.error(e);
    return v1Err("Something went wrong", 500, "INTERNAL_ERROR");
  }
}
