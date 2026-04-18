import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/api/require-auth-user";
import { connectDB } from "@/lib/mongodb";
import { v1Err } from "@/lib/api/v1-response";
import { AccountModel } from "@/models/Account";
import mongoose from "mongoose";

type RouteCtx = { params: Promise<{ id: string }> };

const ACCOUNT_TYPES = new Set(["Bank", "Cash", "Stocks", "Crypto"]);

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
    const oid = new mongoose.Types.ObjectId(id);

    const acc = await AccountModel.findOne({
      _id: oid,
      userId: uid,
      isArchived: false,
    });
    if (!acc) return v1Err("Not found", 404, "NOT_FOUND");

    if (typeof body.name === "string" && body.name.trim()) {
      acc.name = body.name.trim();
    }
    if (typeof body.balance === "number" && Number.isFinite(body.balance)) {
      acc.balance = body.balance;
    }
    if (typeof body.institution === "string") {
      acc.institution = body.institution.trim() || undefined;
    }
    if (typeof body.accountNumber === "string") {
      acc.accountNumber = body.accountNumber.trim() || undefined;
    }
    if (typeof body.currency === "string" && body.currency.trim()) {
      acc.currency = body.currency.trim();
    }
    if (typeof body.type === "string" && ACCOUNT_TYPES.has(body.type)) {
      acc.type = body.type as typeof acc.type;
    }

    await acc.save();

    const lean = acc.toObject();
    return NextResponse.json({
      success: true as const,
      data: {
        _id: String(lean._id),
        name: lean.name,
        balance: lean.balance,
      },
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
    const oid = new mongoose.Types.ObjectId(id);

    const acc = await AccountModel.findOne({
      _id: oid,
      userId: uid,
      isArchived: false,
    });
    if (!acc) return v1Err("Not found", 404, "NOT_FOUND");

    acc.isArchived = true;
    await acc.save();

    return NextResponse.json({
      success: true as const,
      message: "Account archived",
      data: { _id: String(acc._id), isArchived: true as const },
    });
  } catch (e) {
    console.error(e);
    return v1Err("Something went wrong", 500, "INTERNAL_ERROR");
  }
}
