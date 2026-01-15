import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  profilePath: string;
  password: string;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  isVerified: boolean;
  passwordHistory?: Array<{
    password: string;
    changedAt: Date;
  }>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    profilePath: {
      type: String,
      default: '',
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    currency: {
      type: String,
      enum: ['INR', 'USD', 'EUR', 'GBP'],
      default: 'INR',
    },
    createdBy: {
      type: String,
      default: undefined,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    passwordHistory: {
      type: [
        {
          password: {
            type: String,
            required: true,
          },
          changedAt: {
            type: Date,
            required: true,
            default: Date.now,
          },
        },
      ],
      default: [],
      select: false, // Don't include in queries by default
    },
  },
  {
    timestamps: true,
  }
);

// Database Indexes for Performance
// Email index (unique) - Most common query field
UserSchema.index({ email: 1 }, { unique: true });

// CreatedAt index (descending) - For sorting by creation date
UserSchema.index({ createdAt: -1 });

// isVerified index - For filtering verified/unverified users
UserSchema.index({ isVerified: 1 });

// Compound index for common queries (e.g., find verified users sorted by creation date)
UserSchema.index({ isVerified: 1, createdAt: -1 });

export default mongoose.model<IUser>('User', UserSchema);
