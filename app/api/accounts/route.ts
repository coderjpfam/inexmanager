import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/api/require-auth-user";
import { connectDB } from "@/lib/mongodb";
import { v1Err } from "@/lib/api/v1-response";
import {
  accountCreatedBody,
  accountToListItem,
  type AccountLeanForApi,
} from "@/lib/accounts/serialize";
import { AccountModel } from "@/models/Account";
import mongoose from "mongoose";

const ACCOUNT_TYPES = new Set(["Bank", "Cash", "Stocks", "Crypto"]);

/** GET /api/accounts — list active accounts; POST — create (references/api.md § Accounts). */
export async function GET(request: Request) {
  try {
    const auth = await requireAuthUser(request);
    if (!auth.ok) return auth.response;

    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);
    const rows = await AccountModel.find({ userId: uid, isArchived: false })
      .sort({ name: 1 })
      .lean();

    const data = rows.map((a) => accountToListItem(a as AccountLeanForApi));

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
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const typeRaw = body.type;
    const balance =
      typeof body.balance === "number" && Number.isFinite(body.balance) ? body.balance : 0;
    const currency =
      typeof body.currency === "string" && body.currency.trim() ? body.currency.trim() : "INR";
    const institution =
      typeof body.institution === "string" && body.institution.trim()
        ? body.institution.trim()
        : undefined;
    const accountNumber =
      typeof body.accountNumber === "string" && body.accountNumber.trim()
        ? body.accountNumber.trim()
        : undefined;

    if (!name) {
      return v1Err("Name is required", 400, "VALIDATION", "name");
    }
    if (typeof typeRaw !== "string" || !ACCOUNT_TYPES.has(typeRaw)) {
      return v1Err("Invalid account type", 400, "VALIDATION", "type");
    }

    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);
    const doc = await AccountModel.create({
      userId: uid,
      name,
      type: typeRaw as "Bank" | "Cash" | "Stocks" | "Crypto",
      balance,
      currency,
      institution,
      accountNumber,
    });

    const lean = doc.toObject();
    const data = accountCreatedBody(lean as AccountLeanForApi);

    return NextResponse.json({ success: true as const, data }, { status: 201 });
  } catch (e) {
    console.error(e);
    return v1Err("Something went wrong", 500, "INTERNAL_ERROR");
  }
}
