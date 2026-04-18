import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/api/require-auth-user";
import { connectDB } from "@/lib/mongodb";
import { v1Err } from "@/lib/api/v1-response";
import { lendingToDetail, type LendingLean } from "@/lib/lending/serialize";
import { LendingModel } from "@/models/LendingRecord";
import mongoose from "mongoose";

type RouteCtx = { params: Promise<{ id: string }> };

function parseYmd(s: unknown): Date | null {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

export async function GET(_request: Request, ctx: RouteCtx) {
  try {
    const auth = await requireAuthUser(_request);
    if (!auth.ok) return auth.response;

    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) {
      return v1Err("Not found", 404, "NOT_FOUND");
    }

    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);
    const row = await LendingModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: uid,
    }).lean();
    if (!row) return v1Err("Not found", 404, "NOT_FOUND");

    const data = lendingToDetail(row as LendingLean);
    return NextResponse.json({ success: true as const, data });
  } catch (e) {
    console.error(e);
    return v1Err("Something went wrong", 500, "INTERNAL_ERROR");
  }
}

export async function PATCH(request: Request, ctx: RouteCtx) {
  try {
    const auth = await requireAuthUser(request);
    if (!auth.ok) return auth.response;

    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) {
      return v1Err("Not found", 404, "NOT_FOUND");
    }

    const body = (await request.json()) as Record<string, unknown>;
    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);
    const r = await LendingModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: uid,
    });
    if (!r) return v1Err("Not found", 404, "NOT_FOUND");

    if (typeof body.personName === "string" && body.personName.trim()) {
      r.personName = body.personName.trim();
    }
    if (typeof body.totalAmount === "number" && Number.isFinite(body.totalAmount) && body.totalAmount >= 0) {
      r.totalAmount = body.totalAmount;
    }
    if (typeof body.paidAmount === "number" && Number.isFinite(body.paidAmount) && body.paidAmount >= 0) {
      r.paidAmount = body.paidAmount;
    }
    if (typeof body.note === "string") {
      r.note = body.note.trim() || undefined;
    }
    if (typeof body.dueDate === "string") {
      const d = parseYmd(body.dueDate);
      if (!d) return v1Err("dueDate must be YYYY-MM-DD", 400, "VALIDATION", "dueDate");
      r.dueDate = d;
    }
    if (body.status === "Active" || body.status === "Settled" || body.status === "Overdue") {
      r.status = body.status;
    }

    if (r.totalAmount > 0 && r.paidAmount >= r.totalAmount) {
      r.paidAmount = r.totalAmount;
      r.status = "Settled";
    }

    await r.save();

    return NextResponse.json({
      success: true as const,
      data: {
        _id: String(r._id),
        totalAmount: r.totalAmount,
        paidAmount: r.paidAmount,
        status: r.status,
      },
    });
  } catch (e) {
    console.error(e);
    return v1Err("Something went wrong", 500, "INTERNAL_ERROR");
  }
}

export async function DELETE(_request: Request, ctx: RouteCtx) {
  try {
    const auth = await requireAuthUser(_request);
    if (!auth.ok) return auth.response;

    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) {
      return v1Err("Not found", 404, "NOT_FOUND");
    }

    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);
    const res = await LendingModel.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: uid,
    });
    if (res.deletedCount === 0) {
      return v1Err("Not found", 404, "NOT_FOUND");
    }

    return NextResponse.json({
      success: true as const,
      message: "Lending record deleted",
      data: { _id: id },
    });
  } catch (e) {
    console.error(e);
    return v1Err("Something went wrong", 500, "INTERNAL_ERROR");
  }
}
