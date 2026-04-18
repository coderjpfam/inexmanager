import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/api/require-auth-user";
import { connectDB } from "@/lib/mongodb";
import { v1Err } from "@/lib/api/v1-response";
import { deriveLendingMetrics } from "@/lib/lending/metrics";
import { LendingModel } from "@/models/LendingRecord";
import mongoose from "mongoose";

type RouteCtx = { params: Promise<{ id: string }> };

/** POST /api/lending/:id/settle — mark fully settled (references/api.md § Lending). */
export async function POST(request: Request, ctx: RouteCtx) {
  try {
    const auth = await requireAuthUser(request);
    if (!auth.ok) return auth.response;

    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) {
      return v1Err("Not found", 404, "NOT_FOUND");
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const note = typeof body.note === "string" ? body.note.trim() : undefined;

    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);
    const r = await LendingModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: uid,
    });
    if (!r) return v1Err("Not found", 404, "NOT_FOUND");

    r.paidAmount = r.totalAmount;
    r.status = "Settled";
    if (note) {
      r.note = r.note ? `${r.note} · ${note}` : note;
    }

    await r.save();

    const m = deriveLendingMetrics(r.totalAmount, r.paidAmount);

    return NextResponse.json({
      success: true as const,
      data: {
        _id: String(r._id),
        paidAmount: r.paidAmount,
        remainingAmount: m.remainingAmount,
        percentagePaid: m.percentagePaid,
        status: r.status,
      },
    });
  } catch (e) {
    console.error(e);
    return v1Err("Something went wrong", 500, "INTERNAL_ERROR");
  }
}
