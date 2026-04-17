import { adjustAccountBalance, balanceDeltaForTx } from "@/lib/transactions/balance";
import { serializeTransaction } from "@/lib/transactions/serialize";
import { requireAuthUser } from "@/lib/api/require-auth-user";
import { connectDB } from "@/lib/mongodb";
import { v1Err } from "@/lib/api/v1-response";
import { AccountModel } from "@/models/Account";
import { CategoryModel } from "@/models/Category";
import { TransactionModel } from "@/models/Transaction";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

type RouteCtx = { params: Promise<{ id: string }> };

function parseTxDate(s: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
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
    const tx = await TransactionModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: uid,
    }).lean();
    if (!tx) return v1Err("Not found", 404, "NOT_FOUND");

    return NextResponse.json({ success: true as const, data: serializeTransaction(tx as never) });
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
    const tx = await TransactionModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: uid,
    });
    if (!tx) return v1Err("Not found", 404, "NOT_FOUND");

    const oldAccountId = tx.accountId as mongoose.Types.ObjectId | undefined;
    const oldType = tx.type;
    const oldAmount = tx.amount;

    if (!oldAccountId) {
      return v1Err("Transaction has no account", 422, "UNPROCESSABLE");
    }

    await adjustAccountBalance(
      uid,
      oldAccountId,
      -balanceDeltaForTx(oldType, oldAmount),
    );

    if (typeof body.amount === "number" && Number.isFinite(body.amount) && body.amount > 0) {
      tx.amount = body.amount;
    }
    if (typeof body.description === "string") {
      tx.description = body.description.trim() || tx.description;
    }
    if (typeof body.date === "string") {
      const d = parseTxDate(body.date);
      if (d) tx.date = d;
    }
    if (typeof body.notes === "string") tx.notes = body.notes;
    if (Array.isArray(body.tags)) tx.tags = body.tags as string[];
    if (body.type === "income" || body.type === "expense") tx.type = body.type;

    if (typeof body.categoryId === "string" && mongoose.isValidObjectId(body.categoryId)) {
      const cat = await CategoryModel.findOne({
        _id: new mongoose.Types.ObjectId(body.categoryId),
        userId: uid,
      }).lean();
      if (cat) {
        tx.categoryId = cat._id as never;
        tx.categoryName = cat.name;
      }
    }

    let newAccountId = oldAccountId;
    if (typeof body.accountId === "string" && mongoose.isValidObjectId(body.accountId)) {
      const acc = await AccountModel.findOne({
        _id: new mongoose.Types.ObjectId(body.accountId),
        userId: uid,
        isArchived: false,
      }).lean();
      if (acc) {
        newAccountId = acc._id as mongoose.Types.ObjectId;
        tx.accountId = acc._id as never;
        tx.accountName = acc.name;
      }
    }

    await tx.save();

    await adjustAccountBalance(
      uid,
      newAccountId,
      balanceDeltaForTx(tx.type, tx.amount),
    );

    const updatedAcc = await AccountModel.findById(newAccountId).select({ balance: 1 }).lean();

    return NextResponse.json({
      success: true as const,
      data: serializeTransaction(tx),
      accountBalance: updatedAcc?.balance ?? 0,
    });
  } catch (e) {
    console.error(e);
    return v1Err("Something went wrong", 500, "INTERNAL_ERROR");
  }
}

export async function DELETE(request: Request, ctx: RouteCtx) {
  try {
    const auth = await requireAuthUser(request);
    if (!auth.ok) return auth.response;

    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) {
      return v1Err("Not found", 404, "NOT_FOUND");
    }

    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);
    const tx = await TransactionModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: uid,
    });
    if (!tx) return v1Err("Not found", 404, "NOT_FOUND");

    if (tx.accountId) {
      await adjustAccountBalance(
        uid,
        tx.accountId as mongoose.Types.ObjectId,
        -balanceDeltaForTx(tx.type, tx.amount),
      );
    }

    await TransactionModel.deleteOne({ _id: tx._id, userId: uid });

    const accBal =
      tx.accountId &&
      (await AccountModel.findById(tx.accountId).select({ balance: 1 }).lean());

    return NextResponse.json({
      success: true as const,
      message: "Transaction deleted",
      data: { _id: String(tx._id) },
      accountBalance: accBal?.balance ?? 0,
    });
  } catch (e) {
    console.error(e);
    return v1Err("Something went wrong", 500, "INTERNAL_ERROR");
  }
}
