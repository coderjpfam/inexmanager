import jwt, { type SignOptions } from "jsonwebtoken";

export type AccessJwtPayload = {
  sub: string;
  email: string;
  purpose: "access";
};

export type ResetJwtPayload = {
  sub: string;
  email: string;
  purpose: "password_reset";
};

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return secret;
}

export function signAccessToken(userId: string, email: string): string {
  const payload: AccessJwtPayload = {
    sub: userId,
    email,
    purpose: "access",
  };
  const expiresIn = process.env.JWT_EXPIRES_IN ?? "7d";
  return jwt.sign(payload, getSecret(), { expiresIn } as SignOptions);
}

export function signPasswordResetToken(
  userId: string,
  email: string,
): string {
  const payload: ResetJwtPayload = {
    sub: userId,
    email,
    purpose: "password_reset",
  };
  const expiresIn = process.env.JWT_RESET_EXPIRES_IN ?? "1h";
  return jwt.sign(payload, getSecret(), { expiresIn } as SignOptions);
}

export function verifyAccessToken(token: string): AccessJwtPayload {
  const decoded = jwt.verify(token, getSecret()) as jwt.JwtPayload & {
    purpose?: string;
  };
  if (decoded.purpose !== "access") {
    throw new Error("Invalid token purpose");
  }
  return {
    sub: String(decoded.sub),
    email: String(decoded.email),
    purpose: "access",
  };
}

export function verifyPasswordResetToken(token: string): ResetJwtPayload {
  const decoded = jwt.verify(token, getSecret()) as jwt.JwtPayload & {
    purpose?: string;
  };
  if (decoded.purpose !== "password_reset") {
    throw new Error("Invalid token purpose");
  }
  return {
    sub: String(decoded.sub),
    email: String(decoded.email),
    purpose: "password_reset",
  };
}
