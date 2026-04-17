import mongoose, { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";

export type UserDocument = mongoose.Document & {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
  },
  { timestamps: true },
);

userSchema.pre("save", async function hashOnSave() {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export const User: mongoose.Model<UserDocument> =
  models.User ?? model<UserDocument>("User", userSchema);
