import { TransactionModel } from "@/models/Transaction";
import type mongoose from "mongoose";

export async function transactionStatsByCategoryId(
  userId: mongoose.Types.ObjectId,
): Promise<Map<string, { transactionCount: number; totalAmount: number }>> {
  const rows = await TransactionModel.aggregate<{
    _id: mongoose.Types.ObjectId;
    transactionCount: number;
    totalAmount: number;
  }>([
    {
      $match: {
        userId,
        categoryId: { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: "$categoryId",
        transactionCount: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  const map = new Map<string, { transactionCount: number; totalAmount: number }>();
  for (const r of rows) {
    if (r._id) {
      map.set(String(r._id), {
        transactionCount: r.transactionCount,
        totalAmount: r.totalAmount,
      });
    }
  }
  return map;
}
