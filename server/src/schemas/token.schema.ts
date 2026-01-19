import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TokenDocument = Token & Document;

@Schema({ timestamps: true })
export class Token {
  @Prop({ required: true, index: true })
  token: string;

  @Prop({
    type: String,
    enum: ['password-reset', 'email-verification'],
    required: true,
    index: true,
  })
  type: 'password-reset' | 'email-verification';

  @Prop({ type: Types.ObjectId, required: true, ref: 'User', index: true })
  userId: Types.ObjectId;

  @Prop({ default: false, index: true })
  used: boolean;

  @Prop({ required: true, index: { expireAfterSeconds: 0 } })
  expiresAt: Date;

  @Prop({ default: undefined })
  usedAt?: Date;
}

export const TokenSchema = SchemaFactory.createForClass(Token);

// Compound indexes for efficient lookups
TokenSchema.index({ token: 1, type: 1, used: 1 });
TokenSchema.index({ userId: 1, type: 1, used: 1 });
// Compound index for cleanup queries
TokenSchema.index({ userId: 1, type: 1, used: 1, expiresAt: 1 });
