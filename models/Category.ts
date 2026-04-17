import mongoose, { Schema, model, models } from "mongoose";

export type CategoryDoc = mongoose.Document & {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: "income" | "expense";
  icon: string;
  color?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const categorySchema = new Schema<CategoryDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    icon: { type: String, default: "📁" },
    color: String,
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

categorySchema.index({ userId: 1, type: 1 });
categorySchema.index({ userId: 1, name: 1 }, { unique: true });

export const CategoryModel: mongoose.Model<CategoryDoc> =
  models.FinanceCategory ??
  model<CategoryDoc>("FinanceCategory", categorySchema, "categories");
