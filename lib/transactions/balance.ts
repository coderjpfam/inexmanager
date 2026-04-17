import type mongoose from "mongoose";
import { AccountModel } from "@/models/Account";

/** Net change to account balance when recording this transaction (income adds, expense subtracts). */
export function balanceDeltaForTx(
  type: "income" | "expense",
  amount: number,
): number {
  return type === "income" ? amount : -amount;
}

export async function adjustAccountBalance(
  userId: mongoose.Types.ObjectId,
  accountId: mongoose.Types.ObjectId,
  delta: number,
): Promise<void> {
  await AccountModel.updateOne(
    { _id: accountId, userId, isArchived: false },
    { $inc: { balance: delta } },
  );
}
