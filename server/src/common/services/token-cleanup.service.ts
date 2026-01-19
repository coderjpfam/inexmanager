import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { Token, TokenDocument } from '../../schemas/token.schema';
import { logInfo, logError } from '../../config/winston.config';

@Injectable()
export class TokenCleanupService {
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
  ) {}

@Injectable()
export class TokenCleanupService {
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredTokens() {
    try {
      const result = await this.tokenModel.deleteMany({
        expiresAt: { $lt: new Date() },
      });

      logInfo(`Token cleanup completed: ${result.deletedCount} expired tokens removed`);
    } catch (error) {
      logError('Error during token cleanup', error);
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async cleanupUsedTokens() {
    try {
      // Clean up tokens that were used more than 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const result = await this.tokenModel.deleteMany({
        used: true,
        usedAt: { $lt: sevenDaysAgo },
      });

      logInfo(`Used token cleanup completed: ${result.deletedCount} old used tokens removed`);
    } catch (error) {
      logError('Error during used token cleanup', error);
    }
  }
}
