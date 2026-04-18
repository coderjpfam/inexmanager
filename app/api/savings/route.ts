import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/api/require-auth-user";
import { connectDB } from "@/lib/mongodb";
import { v1Err } from "@/lib/api/v1-response";
import { savingToListRow, type SavingGoalLean } from "@/lib/savings/serialize";
import { SavingGoalModel } from "@/models/SavingGoal";
import mongoose from "mongoose";

function parseYmd(s: unknown): Date | null {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

/** GET /api/savings — list goals; POST — create (references/api.md § Savings). */
export async function GET(request: Request) {
  try {
    const auth = await requireAuthUser(request);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);
    const filter: Record<string, unknown> = { userId: uid };
    if (status === "Active" || status === "Paused" || status === "Completed") {
      filter.status = status;
    }

    const rows = await SavingGoalModel.find(filter).sort({ createdAt: -1 }).lean();
    const data = rows.map((r) => savingToListRow(r as SavingGoalLean));
    const totalSaved = rows.reduce((sum, r) => sum + (r.savedAmount ?? 0), 0);

    return NextResponse.json({
      success: true as const,
      data,
      count: data.length,
      totalSaved,
    });
  } catch (e) {
    console.error(e);
    return v1Err("Something went wrong", 500, "INTERNAL_ERROR");
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuthUser(request);
    if (!auth.ok) return auth.response;

    const body = (await request.json()) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const targetAmount = body.targetAmount;
    const savedAmount =
      typeof body.savedAmount === "number" && Number.isFinite(body.savedAmount) ? body.savedAmount : 0;
    const targetDate = parseYmd(body.targetDate);
    const icon = typeof body.icon === "string" ? body.icon.trim() : undefined;
    const notes = typeof body.notes === "string" ? body.notes.trim() : undefined;

    if (!name) {
      return v1Err("name is required", 400, "VALIDATION", "name");
    }
    if (typeof targetAmount !== "number" || !Number.isFinite(targetAmount) || targetAmount < 0) {
      return v1Err("targetAmount must be a non-negative number", 400, "VALIDATION", "targetAmount");
    }
    if (savedAmount < 0) {
      return v1Err("savedAmount must be non-negative", 400, "VALIDATION", "savedAmount");
    }
    if (body.targetDate != null && !targetDate) {
      return v1Err("targetDate must be YYYY-MM-DD", 400, "VALIDATION", "targetDate");
    }

    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);

    const contributions: Array<{ amount: number; date: Date; note?: string }> = [];
    if (savedAmount > 0) {
      contributions.push({
        amount: savedAmount,
        date: new Date(),
        note: "Initial balance",
      });
    }

    const initialStatus =
      targetAmount > 0 && savedAmount >= targetAmount ? "Completed" : "Active";

    const doc = await SavingGoalModel.create({
      userId: uid,
      name,
      targetAmount,
      savedAmount: Math.min(savedAmount, targetAmount > 0 ? targetAmount : savedAmount),
      targetDate: targetDate ?? undefined,
      status: initialStatus,
      icon,
      notes,
      contributions,
    });

    const lean = doc.toObject();
    const td = lean.targetDate ? new Date(lean.targetDate).toISOString().split("T")[0] : undefined;

    return NextResponse.json(
      {
        success: true as const,
        data: {
          _id: String(lean._id),
          name: lean.name,
          targetAmount: lean.targetAmount,
          savedAmount: lean.savedAmount,
          status: lean.status,
          ...(td ? { targetDate: td } : {}),
          createdAt: new Date(lean.createdAt).toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (e) {
    console.error(e);
    return v1Err("Something went wrong", 500, "INTERNAL_ERROR");
  }
}
