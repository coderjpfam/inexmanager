import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User, UserSchema } from '../schemas/user.schema';
import { Token, TokenSchema } from '../schemas/token.schema';
import { EmailService } from '../common/services/email.service';
import { PasswordValidationService } from '../common/services/password-validation.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Token.name, schema: TokenSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailService,
    PasswordValidationService,
    JwtAuthGuard,
  ],
  exports: [AuthService],
})
export class AuthModule {}
