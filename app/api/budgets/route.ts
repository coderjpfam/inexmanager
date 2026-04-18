import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/api/require-auth-user";
import { connectDB } from "@/lib/mongodb";
import { v1Err } from "@/lib/api/v1-response";
import { budgetToApiRow } from "@/lib/budgets/serialize-row";
import { currentMonthUtc, monthUtcRange } from "@/lib/budgets/spend-range";
import { BudgetModel } from "@/models/Budget";
import { CategoryModel } from "@/models/Category";
import mongoose from "mongoose";

function parseCustomDate(s: unknown): Date | null {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

/** GET /api/budgets — list with live spend; POST — create (references/api.md § Budgets). */
export async function GET(request: Request) {
  try {
    const auth = await requireAuthUser(request);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const periodFilter = searchParams.get("period");
    const monthParam = searchParams.get("month")?.trim();
    const month =
      monthParam && monthUtcRange(monthParam) ? monthParam : currentMonthUtc();

    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);

    const filter: Record<string, unknown> = { userId: uid };
    if (periodFilter === "Weekly" || periodFilter === "Monthly" || periodFilter === "Custom") {
      filter.period = periodFilter;
    }

    const rows = await BudgetModel.find(filter).sort({ categoryName: 1 }).lean();

    const data = await Promise.all(
      rows.map((row) => budgetToApiRow(uid, row as Parameters<typeof budgetToApiRow>[1], month)),
    );

    return NextResponse.json({
      success: true as const,
      data,
      count: data.length,
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
    const categoryId = body.categoryId;
    const limitAmount = body.limitAmount;
    const period = body.period;
    const alertThreshold =
      typeof body.alertThreshold === "number" && Number.isFinite(body.alertThreshold)
        ? body.alertThreshold
        : 75;

    if (typeof categoryId !== "string" || !mongoose.isValidObjectId(categoryId)) {
      return v1Err("categoryId is required", 400, "VALIDATION", "categoryId");
    }
    if (typeof limitAmount !== "number" || !Number.isFinite(limitAmount) || limitAmount < 0) {
      return v1Err("limitAmount must be a non-negative number", 400, "VALIDATION", "limitAmount");
    }
    if (period !== "Weekly" && period !== "Monthly" && period !== "Custom") {
      return v1Err("Invalid period", 400, "VALIDATION", "period");
    }

    let customStartDate: Date | undefined;
    let customEndDate: Date | undefined;
    if (period === "Custom") {
      const cs = parseCustomDate(body.customStartDate);
      const ce = parseCustomDate(body.customEndDate);
      if (!cs || !ce) {
        return v1Err(
          "Custom period requires customStartDate and customEndDate (YYYY-MM-DD)",
          400,
          "VALIDATION",
        );
      }
      if (cs > ce) {
        return v1Err("customStartDate must be on or before customEndDate", 400, "VALIDATION");
      }
      customStartDate = cs;
      customEndDate = ce;
    }

    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);
    const cat = await CategoryModel.findOne({
      _id: new mongoose.Types.ObjectId(categoryId),
      userId: uid,
    }).lean();
    if (!cat) {
      return v1Err("Category not found", 404, "NOT_FOUND", "categoryId");
    }
    if (cat.type !== "expense") {
      return v1Err("Budget category must be an expense category", 400, "VALIDATION", "categoryId");
    }

    try {
      const doc = await BudgetModel.create({
        userId: uid,
        categoryId: cat._id,
        categoryName: cat.name,
        categoryIcon: cat.icon,
        limitAmount,
        period,
        customStartDate,
        customEndDate,
        alertThreshold,
        isActive: true,
      });

      const lean = doc.toObject();
      return NextResponse.json(
        {
          success: true as const,
          data: {
            _id: String(lean._id),
            categoryId: String(cat._id),
            categoryName: cat.name,
            limitAmount,
            period,
            alertThreshold,
            isActive: true,
            createdAt: new Date(lean.createdAt).toISOString(),
          },
        },
        { status: 201 },
      );
    } catch (err: unknown) {
      const code = err && typeof err === "object" && "code" in err ? (err as { code?: number }).code : undefined;
      if (code === 11000) {
        return v1Err("A budget already exists for this category", 409, "CONFLICT");
      }
      throw err;
    }
  } catch (e) {
    console.error(e);
    return v1Err("Something went wrong", 500, "INTERNAL_ERROR");
  }
}
