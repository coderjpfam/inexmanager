import mongoose, { Schema, model, models } from "mongoose";

export type BudgetDoc = mongoose.Document & {
  userId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  categoryName: string;
  categoryIcon?: string;
  limitAmount: number;
  period: "Weekly" | "Monthly" | "Custom";
  customStartDate?: Date;
  customEndDate?: Date;
  alertThreshold: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const budgetSchema = new Schema<BudgetDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, required: true },
    categoryName: { type: String, required: true },
    categoryIcon: { type: String },
    limitAmount: { type: Number, required: true, min: 0 },
    period: {
      type: String,
      enum: ["Weekly", "Monthly", "Custom"],
      default: "Monthly",
    },
    customStartDate: Date,
    customEndDate: Date,
    alertThreshold: { type: Number, default: 75 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

budgetSchema.index({ userId: 1, categoryId: 1 }, { unique: true });

export const BudgetModel: mongoose.Model<BudgetDoc> =
  models.FinanceBudget ??
  model<BudgetDoc>("FinanceBudget", budgetSchema, "budgets");
