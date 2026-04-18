import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/api/require-auth-user";
import { connectDB } from "@/lib/mongodb";
import { v1Err } from "@/lib/api/v1-response";
import { AccountModel } from "@/models/Account";
import mongoose from "mongoose";

/** GET /api/accounts/summary — total balance and by-type breakdown (references/api.md). */
export async function GET(request: Request) {
  try {
    const auth = await requireAuthUser(request);
    if (!auth.ok) return auth.response;

    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);
    const rows = await AccountModel.find({ userId: uid, isArchived: false }).lean();

    const byType: Record<"Bank" | "Cash" | "Stocks" | "Crypto", number> = {
      Bank: 0,
      Cash: 0,
      Stocks: 0,
      Crypto: 0,
    };
    let totalBalance = 0;
    for (const a of rows) {
      const b = a.balance ?? 0;
      totalBalance += b;
      if (a.type in byType) {
        byType[a.type as keyof typeof byType] += b;
      }
    }

    return NextResponse.json({
      success: true as const,
      data: { totalBalance, byType },
    });
  } catch (e) {
    console.error(e);
    return v1Err("Something went wrong", 500, "INTERNAL_ERROR");
  }
}
