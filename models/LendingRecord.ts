import mongoose, { Schema, model, models } from "mongoose";

const paymentSchema = new Schema(
  {
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    note: { type: String },
  },
  { _id: false },
);

export type LendingRecordDoc = mongoose.Document & {
  userId: mongoose.Types.ObjectId;
  direction: "lend" | "borrow";
  personName: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: Date;
  note?: string;
  status: "Active" | "Settled" | "Overdue";
  payments: Array<{ amount: number; date: Date; note?: string }>;
  createdAt: Date;
  updatedAt: Date;
};

const lendingSchema = new Schema<LendingRecordDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    direction: { type: String, enum: ["lend", "borrow"], required: true },
    personName: { type: String, required: true, trim: true },
    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    dueDate: { type: Date, required: true },
    note: String,
    status: {
      type: String,
      enum: ["Active", "Settled", "Overdue"],
      default: "Active",
    },
    payments: { type: [paymentSchema], default: [] },
  },
  { timestamps: true },
);

lendingSchema.index({ userId: 1, status: 1 });
lendingSchema.index({ userId: 1, direction: 1 });

export const LendingModel: mongoose.Model<LendingRecordDoc> =
  models.FinanceLending ??
  model<LendingRecordDoc>("FinanceLending", lendingSchema, "lending");
