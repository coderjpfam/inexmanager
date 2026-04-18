import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/api/require-auth-user";
import { connectDB } from "@/lib/mongodb";
import { v1Err } from "@/lib/api/v1-response";
import { deriveLendingMetrics } from "@/lib/lending/metrics";
import { paymentToJson } from "@/lib/lending/serialize";
import { LendingModel } from "@/models/LendingRecord";
import mongoose from "mongoose";

type RouteCtx = { params: Promise<{ id: string }> };

function parseYmd(s: unknown): Date | null {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

/** POST /api/lending/:id/pay — record payment (references/api.md § Lending). */
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
    const r = await LendingModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: uid,
    });
    if (!r) return v1Err("Not found", 404, "NOT_FOUND");

    if (r.status === "Settled") {
      return v1Err("Record is already settled", 400, "VALIDATION");
    }

    const prevPaid = r.paidAmount ?? 0;
    const total = r.totalAmount;
    const room = Math.max(0, total - prevPaid);
    const applied = Math.min(amount, room);
    if (applied <= 0) {
      return v1Err("Nothing left to pay", 400, "VALIDATION");
    }

    r.payments = r.payments ?? [];
    r.payments.push({ amount: applied, date, note });
    r.paidAmount = prevPaid + applied;

    if (r.paidAmount >= total) {
      r.paidAmount = total;
      r.status = "Settled";
    }

    await r.save();

    const m = deriveLendingMetrics(r.totalAmount, r.paidAmount);
    const last = r.payments[r.payments.length - 1]!;

    return NextResponse.json({
      success: true as const,
      data: {
        _id: String(r._id),
        paidAmount: r.paidAmount,
        remainingAmount: m.remainingAmount,
        percentagePaid: m.percentagePaid,
        status: r.status,
        lastPayment: paymentToJson(last),
      },
    });
  } catch (e) {
    console.error(e);
    return v1Err("Something went wrong", 500, "INTERNAL_ERROR");
  }
}
