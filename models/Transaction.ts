import mongoose, { Schema, model, models } from "mongoose";

export type TransactionDoc = mongoose.Document & {
  userId: mongoose.Types.ObjectId;
  type: "income" | "expense";
  amount: number;
  description: string;
  categoryId?: mongoose.Types.ObjectId;
  categoryName: string;
  accountId?: mongoose.Types.ObjectId;
  accountName: string;
  date: Date;
  notes?: string;
  tags?: string[];
  isRecurring: boolean;
  isSplit: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const transactionSchema = new Schema<TransactionDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    categoryId: { type: Schema.Types.ObjectId },
    categoryName: { type: String, default: "" },
    accountId: { type: Schema.Types.ObjectId },
    accountName: { type: String, default: "" },
    date: { type: Date, required: true, index: true },
    notes: { type: String },
    tags: [{ type: String }],
    isRecurring: { type: Boolean, default: false },
    isSplit: { type: Boolean, default: false },
  },
  { timestamps: true },
);

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1, date: -1 });
transactionSchema.index({ userId: 1, categoryId: 1 });

export const TransactionModel: mongoose.Model<TransactionDoc> =
  models.FinanceTransaction ??
  model<TransactionDoc>("FinanceTransaction", transactionSchema, "transactions");
