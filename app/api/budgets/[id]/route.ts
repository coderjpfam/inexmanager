import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/api/require-auth-user";
import { connectDB } from "@/lib/mongodb";
import { v1Err } from "@/lib/api/v1-response";
import { budgetToApiRow } from "@/lib/budgets/serialize-row";
import { currentMonthUtc, monthUtcRange } from "@/lib/budgets/spend-range";
import { BudgetModel } from "@/models/Budget";
import { CategoryModel } from "@/models/Category";
import mongoose from "mongoose";

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: RouteCtx) {
  try {
    const auth = await requireAuthUser(request);
    if (!auth.ok) return auth.response;

    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) {
      return v1Err("Not found", 404, "NOT_FOUND");
    }

    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month")?.trim();
    const month =
      monthParam && monthUtcRange(monthParam) ? monthParam : currentMonthUtc();

    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);
    const row = await BudgetModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: uid,
    }).lean();
    if (!row) return v1Err("Not found", 404, "NOT_FOUND");

    const data = await budgetToApiRow(uid, row as Parameters<typeof budgetToApiRow>[1], month);
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
    const b = await BudgetModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: uid,
    });
    if (!b) return v1Err("Not found", 404, "NOT_FOUND");

    if (typeof body.limitAmount === "number" && Number.isFinite(body.limitAmount) && body.limitAmount >= 0) {
      b.limitAmount = body.limitAmount;
    }
    if (typeof body.alertThreshold === "number" && Number.isFinite(body.alertThreshold)) {
      b.alertThreshold = body.alertThreshold;
    }
    if (typeof body.isActive === "boolean") {
      b.isActive = body.isActive;
    }
    if (body.period === "Weekly" || body.period === "Monthly" || body.period === "Custom") {
      b.period = body.period;
    }

    if (typeof body.categoryId === "string" && mongoose.isValidObjectId(body.categoryId)) {
      const cat = await CategoryModel.findOne({
        _id: new mongoose.Types.ObjectId(body.categoryId),
        userId: uid,
      }).lean();
      if (!cat) {
        return v1Err("Category not found", 404, "NOT_FOUND", "categoryId");
      }
      if (cat.type !== "expense") {
        return v1Err("Budget category must be an expense category", 400, "VALIDATION", "categoryId");
      }
      b.categoryId = cat._id as never;
      b.categoryName = cat.name;
      b.categoryIcon = cat.icon;
    }

    try {
      await b.save();
    } catch (err: unknown) {
      const code = err && typeof err === "object" && "code" in err ? (err as { code?: number }).code : undefined;
      if (code === 11000) {
        return v1Err("A budget already exists for this category", 409, "CONFLICT");
      }
      throw err;
    }

    return NextResponse.json({
      success: true as const,
      data: {
        _id: String(b._id),
        limitAmount: b.limitAmount,
        alertThreshold: b.alertThreshold,
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

    const res = await BudgetModel.deleteOne({ _id: oid, userId: uid });
    if (res.deletedCount === 0) {
      return v1Err("Not found", 404, "NOT_FOUND");
    }

    return NextResponse.json({
      success: true as const,
      message: "Budget deleted",
      data: { _id: id },
    });
  } catch (e) {
    console.error(e);
    return v1Err("Something went wrong", 500, "INTERNAL_ERROR");
  }
}
