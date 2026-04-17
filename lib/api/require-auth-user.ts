import { connectDB } from "@/lib/mongodb";
import { verifyAccessToken } from "@/lib/jwt-auth";
import { User } from "@/models/User";
import { v1Err } from "@/lib/api/v1-response";

export type AuthUserResult =
  | { ok: true; userId: string }
  | { ok: false; response: ReturnType<typeof v1Err> };

export async function requireAuthUser(request: Request): Promise<AuthUserResult> {
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) {
    return { ok: false, response: v1Err("No token provided", 401, "UNAUTHORIZED") };
  }

  let payload: { sub: string; email: string };
  try {
    payload = verifyAccessToken(token);
  } catch {
    return {
      ok: false,
      response: v1Err("Invalid or expired token", 401, "UNAUTHORIZED"),
    };
  }

  await connectDB();
  const user = await User.findOne({
    _id: payload.sub,
    email: payload.email,
  }).lean();
  if (!user) {
    return {
      ok: false,
      response: v1Err("Invalid or expired token", 401, "UNAUTHORIZED"),
    };
  }

  return { ok: true, userId: String(user._id) };
}
