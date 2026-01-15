/**
 * Token Model
 * Tracks used tokens (password reset, email verification) to prevent reuse
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IToken extends Document {
  _id: mongoose.Types.ObjectId;
  token: string; // The JWT token string
  type: 'password-reset' | 'email-verification';
  userId: mongoose.Types.ObjectId;
  used: boolean;
  expiresAt: Date;
  createdAt: Date;
  usedAt?: Date;
}

const TokenSchema = new Schema<IToken>(
  {
    token: {
      type: String,
      required: true,
      index: true, // Index for fast lookups
    },
    type: {
      type: String,
      enum: ['password-reset', 'email-verification'],
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    used: {
      type: Boolean,
      default: false,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // TTL index - auto-delete expired tokens
    },
    usedAt: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient lookups
TokenSchema.index({ token: 1, type: 1, used: 1 });
TokenSchema.index({ userId: 1, type: 1, used: 1 });

export default mongoose.model<IToken>('Token', TokenSchema);
