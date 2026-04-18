import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/api/require-auth-user";
import { connectDB } from "@/lib/mongodb";
import { v1Err } from "@/lib/api/v1-response";
import { formatDateYmd } from "@/lib/lending/metrics";
import { computeLendingSummary } from "@/lib/lending/summary";
import { lendingToListRow, type LendingLean } from "@/lib/lending/serialize";
import { LendingModel } from "@/models/LendingRecord";
import mongoose from "mongoose";

function parseYmd(s: unknown): Date | null {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

function startOfTodayUtc(): Date {
  const t = new Date();
  return new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate(), 0, 0, 0, 0));
}

/** GET /api/lending — list + summary; POST — create (references/api.md § Lending). */
export async function GET(request: Request) {
  try {
    const auth = await requireAuthUser(request);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const direction = searchParams.get("direction");
    const status = searchParams.get("status");

    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);

    await LendingModel.updateMany(
      { userId: uid, status: "Active", dueDate: { $lt: startOfTodayUtc() } },
      { $set: { status: "Overdue" } },
    );

    const filter: Record<string, unknown> = { userId: uid };
    if (direction === "lend" || direction === "borrow") {
      filter.direction = direction;
    }
    if (status === "Active" || status === "Settled" || status === "Overdue") {
      filter.status = status;
    }

    const rows = await LendingModel.find(filter).sort({ dueDate: 1 }).lean();
    const data = rows.map((r) => lendingToListRow(r as LendingLean));
    const summary = computeLendingSummary(rows as LendingLean[]);

    return NextResponse.json({
      success: true as const,
      data,
      count: data.length,
      summary,
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
    const direction = body.direction;
    const personName = typeof body.personName === "string" ? body.personName.trim() : "";
    const totalAmount = body.totalAmount;
    const dueDate = parseYmd(body.dueDate);
    const note = typeof body.note === "string" ? body.note.trim() : undefined;

    if (direction !== "lend" && direction !== "borrow") {
      return v1Err("direction must be lend or borrow", 400, "VALIDATION", "direction");
    }
    if (!personName) {
      return v1Err("personName is required", 400, "VALIDATION", "personName");
    }
    if (typeof totalAmount !== "number" || !Number.isFinite(totalAmount) || totalAmount <= 0) {
      return v1Err("totalAmount must be a positive number", 400, "VALIDATION", "totalAmount");
    }
    if (!dueDate) {
      return v1Err("dueDate is required (YYYY-MM-DD)", 400, "VALIDATION", "dueDate");
    }

    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);

    const doc = await LendingModel.create({
      userId: uid,
      direction,
      personName,
      totalAmount,
      paidAmount: 0,
      dueDate,
      note,
      status: "Active",
      payments: [],
    });

    const lean = doc.toObject();
    const dueStr = formatDateYmd(new Date(lean.dueDate));

    return NextResponse.json(
      {
        success: true as const,
        data: {
          _id: String(lean._id),
          direction: lean.direction,
          personName: lean.personName,
          totalAmount: lean.totalAmount,
          paidAmount: lean.paidAmount,
          status: lean.status,
          dueDate: dueStr,
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
