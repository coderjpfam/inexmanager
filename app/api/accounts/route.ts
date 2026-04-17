import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/api/require-auth-user";
import { connectDB } from "@/lib/mongodb";
import { v1Err } from "@/lib/api/v1-response";
import { AccountModel } from "@/models/Account";
import mongoose from "mongoose";

/** GET /api/accounts — list active accounts (see references/api.md § Accounts). */
export async function GET(request: Request) {
  try {
    const auth = await requireAuthUser(request);
    if (!auth.ok) return auth.response;

    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);
    const rows = await AccountModel.find({ userId: uid, isArchived: false })
      .sort({ name: 1 })
      .lean();

    const data = rows.map((a) => ({
      _id: String(a._id),
      name: a.name,
      type: a.type,
      balance: a.balance,
      currency: a.currency ?? "INR",
      institution: a.institution,
      isArchived: a.isArchived,
      createdAt: new Date(a.createdAt).toISOString(),
    }));

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
