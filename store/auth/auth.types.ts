export type AuthUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthTokenResponse = {
  token: string;
  user: AuthUser;
};

export type SignInPayload = {
  email: string;
  password: string;
};

export type SignUpPayload = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  token: string;
  newPassword: string;
  confirmPassword: string;
};

export type ValidateTokenPayload = {
  token: string;
};

export type ApiSuccess<T> = { ok: true } & T;

export type ApiErrorBody = {
  ok: false;
  message: string;
};
