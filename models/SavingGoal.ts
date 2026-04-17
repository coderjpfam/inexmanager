import mongoose, { Schema, model, models } from "mongoose";

const contributionSchema = new Schema(
  {
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    note: { type: String },
  },
  { _id: false },
);

export type SavingGoalDoc = mongoose.Document & {
  userId: mongoose.Types.ObjectId;
  name: string;
  targetAmount: number;
  savedAmount: number;
  targetDate?: Date;
  status: "Active" | "Paused" | "Completed";
  icon?: string;
  notes?: string;
  contributions: Array<{ amount: number; date: Date; note?: string }>;
  createdAt: Date;
  updatedAt: Date;
};

const savingSchema = new Schema<SavingGoalDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    targetAmount: { type: Number, required: true, min: 0 },
    savedAmount: { type: Number, default: 0, min: 0 },
    targetDate: Date,
    status: {
      type: String,
      enum: ["Active", "Paused", "Completed"],
      default: "Active",
    },
    icon: String,
    notes: String,
    contributions: { type: [contributionSchema], default: [] },
  },
  { timestamps: true },
);

savingSchema.index({ userId: 1, status: 1 });

export const SavingGoalModel: mongoose.Model<SavingGoalDoc> =
  models.FinanceSavingGoal ??
  model<SavingGoalDoc>("FinanceSavingGoal", savingSchema, "savings");
