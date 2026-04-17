import { adjustAccountBalance, balanceDeltaForTx } from "@/lib/transactions/balance";
import { listTransactionsForUser } from "@/lib/transactions/list-query";
import { serializeTransaction } from "@/lib/transactions/serialize";
import { requireAuthUser } from "@/lib/api/require-auth-user";
import { connectDB } from "@/lib/mongodb";
import { v1Err } from "@/lib/api/v1-response";
import { AccountModel } from "@/models/Account";
import { CategoryModel } from "@/models/Category";
import { TransactionModel } from "@/models/Transaction";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

function parseTxDate(s: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

export async function GET(request: Request) {
  try {
    const auth = await requireAuthUser(request);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const sort = searchParams.get("sort");

    await connectDB();
    const result = await listTransactionsForUser(auth.userId, {
      type:
        type === "income" || type === "expense"
          ? type
          : undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
      accountId: searchParams.get("accountId") ?? undefined,
      startDate: searchParams.get("startDate") ?? undefined,
      endDate: searchParams.get("endDate") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      sort:
        sort === "date_asc" ||
        sort === "amount_desc" ||
        sort === "amount_asc" ||
        sort === "date_desc"
          ? sort
          : "date_desc",
      page: page ? Number.parseInt(page, 10) : 1,
      limit: limit ? Number.parseInt(limit, 10) : 20,
    });

    return NextResponse.json({
      success: true as const,
      data: result.data,
      pagination: result.pagination,
      summary: result.summary,
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
    const type = body.type;
    const amount = body.amount;
    const description = body.description;
    const categoryId = body.categoryId;
    const accountId = body.accountId;
    const dateStr = body.date;

    if (type !== "income" && type !== "expense") {
      return v1Err("type must be income or expense", 400, "VALIDATION_ERROR", "type");
    }
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
      return v1Err("amount must be a positive number", 400, "VALIDATION_ERROR", "amount");
    }
    if (typeof description !== "string" || !description.trim()) {
      return v1Err("description is required", 400, "VALIDATION_ERROR", "description");
    }
    if (typeof categoryId !== "string" || !mongoose.isValidObjectId(categoryId)) {
      return v1Err("categoryId is required", 400, "VALIDATION_ERROR", "categoryId");
    }
    if (typeof accountId !== "string" || !mongoose.isValidObjectId(accountId)) {
      return v1Err("accountId is required", 400, "VALIDATION_ERROR", "accountId");
    }
    if (typeof dateStr !== "string") {
      return v1Err("date is required (YYYY-MM-DD)", 400, "VALIDATION_ERROR", "date");
    }
    const txDate = parseTxDate(dateStr);
    if (!txDate) {
      return v1Err("Invalid date", 400, "VALIDATION_ERROR", "date");
    }

    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);
    const cat = await CategoryModel.findOne({
      _id: new mongoose.Types.ObjectId(categoryId),
      userId: uid,
    }).lean();
    const acc = await AccountModel.findOne({
      _id: new mongoose.Types.ObjectId(accountId),
      userId: uid,
      isArchived: false,
    }).lean();
    if (!cat || !acc) {
      return v1Err("Invalid category or account", 400, "VALIDATION_ERROR");
    }

    const doc = await TransactionModel.create({
      userId: uid,
      type,
      amount,
      description: description.trim(),
      categoryId: cat._id,
      categoryName: cat.name,
      accountId: acc._id,
      accountName: acc.name,
      date: txDate,
      notes: typeof body.notes === "string" ? body.notes : undefined,
      tags: Array.isArray(body.tags) ? (body.tags as string[]) : undefined,
      isRecurring: Boolean(body.isRecurring),
      isSplit: Boolean(body.isSplit),
    });

    await adjustAccountBalance(uid, acc._id, balanceDeltaForTx(type, amount));

    const updatedAcc = await AccountModel.findById(acc._id).select({ balance: 1 }).lean();

    return NextResponse.json(
      {
        success: true as const,
        data: serializeTransaction(doc),
        accountBalance: updatedAcc?.balance ?? 0,
      },
      { status: 201 },
    );
  } catch (e) {
    console.error(e);
    return v1Err("Something went wrong", 500, "INTERNAL_ERROR");
  }
}
