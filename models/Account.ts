import mongoose, { Schema, model, models } from "mongoose";

export type AccountDoc = mongoose.Document & {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: "Bank" | "Cash" | "Stocks" | "Crypto";
  balance: number;
  currency: string;
  institution?: string;
  accountNumber?: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const accountSchema = new Schema<AccountDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["Bank", "Cash", "Stocks", "Crypto"],
      required: true,
    },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    institution: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

accountSchema.index({ userId: 1, isArchived: 1 });

export const AccountModel: mongoose.Model<AccountDoc> =
  models.FinanceAccount ??
  model<AccountDoc>("FinanceAccount", accountSchema, "accounts");
