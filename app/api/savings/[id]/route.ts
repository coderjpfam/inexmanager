import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/api/require-auth-user";
import { connectDB } from "@/lib/mongodb";
import { v1Err } from "@/lib/api/v1-response";
import { savingToDetail, type SavingGoalLean } from "@/lib/savings/serialize";
import { SavingGoalModel } from "@/models/SavingGoal";
import mongoose from "mongoose";

type RouteCtx = { params: Promise<{ id: string }> };

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
    const row = await SavingGoalModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: uid,
    }).lean();
    if (!row) return v1Err("Not found", 404, "NOT_FOUND");

    const data = savingToDetail(row as SavingGoalLean);
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
    const g = await SavingGoalModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: uid,
    });
    if (!g) return v1Err("Not found", 404, "NOT_FOUND");

    if (typeof body.name === "string" && body.name.trim()) {
      g.name = body.name.trim();
    }
    if (typeof body.targetAmount === "number" && Number.isFinite(body.targetAmount) && body.targetAmount >= 0) {
      g.targetAmount = body.targetAmount;
    }
    if (typeof body.savedAmount === "number" && Number.isFinite(body.savedAmount) && body.savedAmount >= 0) {
      g.savedAmount = body.savedAmount;
    }
    if (typeof body.notes === "string") {
      g.notes = body.notes.trim() || undefined;
    }
    if (typeof body.icon === "string") {
      g.icon = body.icon.trim() || undefined;
    }
    if (typeof body.targetDate === "string") {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(body.targetDate)) {
        return v1Err("targetDate must be YYYY-MM-DD", 400, "VALIDATION", "targetDate");
      }
      const [y, m, d] = body.targetDate.split("-").map(Number);
      g.targetDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
    }
    if (body.status === "Active" || body.status === "Paused" || body.status === "Completed") {
      g.status = body.status;
    }

    if (g.targetAmount > 0 && g.savedAmount >= g.targetAmount) {
      g.status = "Completed";
    }

    await g.save();

    return NextResponse.json({
      success: true as const,
      data: {
        _id: String(g._id),
        targetAmount: g.targetAmount,
        status: g.status,
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
    const oid = new mongoose.Types.ObjectId(id);

    const res = await SavingGoalModel.deleteOne({ _id: oid, userId: uid });
    if (res.deletedCount === 0) {
      return v1Err("Not found", 404, "NOT_FOUND");
    }

    return NextResponse.json({
      success: true as const,
      message: "Saving goal deleted",
      data: { _id: id },
    });
  } catch (e) {
    console.error(e);
    return v1Err("Something went wrong", 500, "INTERNAL_ERROR");
  }
}
