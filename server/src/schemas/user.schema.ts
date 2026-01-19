import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export interface PasswordHistory {
  password: string;
  changedAt: Date;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email: string;

  @Prop({ default: '' })
  profilePath: string;

  @Prop({ required: true, minlength: 6, select: false })
  password: string;

  @Prop({
    type: String,
    enum: ['INR', 'USD', 'EUR', 'GBP'],
    default: 'INR',
  })
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';

  @Prop({ default: undefined })
  createdBy?: string;

  @Prop({ default: false, index: true })
  isVerified: boolean;

  @Prop({
    type: [
      {
        password: { type: String, required: true },
        changedAt: { type: Date, required: true, default: Date.now },
      },
    ],
    default: [],
    select: false,
  })
  passwordHistory?: PasswordHistory[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// Database Indexes for Performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ isVerified: 1 });
UserSchema.index({ isVerified: 1, createdAt: -1 });
// Compound index for common queries (email + verification status)
UserSchema.index({ email: 1, isVerified: 1 });
