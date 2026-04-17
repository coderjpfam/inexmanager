import { connectDB } from "@/lib/mongodb";
import { jsonError, jsonOk } from "@/lib/api/auth-helpers";
import { verifyPasswordResetToken } from "@/lib/jwt-auth";
import { User } from "@/models/User";

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(pw)) return "Password needs at least one uppercase letter";
  if (!/[0-9]/.test(pw)) return "Password needs at least one number";
  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const auth = request.headers.get("authorization");
    const bearer = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    const token =
      (typeof body.token === "string" && body.token.trim()) || bearer;

    const newPassword =
      typeof body.newPassword === "string" ? body.newPassword : "";
    const confirm =
      typeof body.confirmPassword === "string" ? body.confirmPassword : "";

    if (!token) {
      return jsonError("Token is required", 400);
    }
    if (!newPassword) {
      return jsonError("New password is required", 400);
    }
    const pwErr = validatePassword(newPassword);
    if (pwErr) {
      return jsonError(pwErr, 400);
    }
    if (newPassword !== confirm) {
      return jsonError("Passwords do not match", 400);
    }

    let payload;
    try {
      payload = verifyPasswordResetToken(token);
    } catch {
      return jsonError("Invalid or expired reset link", 401);
    }

    await connectDB();
    const user = await User.findOne({
      _id: payload.sub,
      email: payload.email,
    });
    if (!user) {
      return jsonError("Invalid or expired reset link", 401);
    }

    user.password = newPassword;
    await user.save();

    return jsonOk({ message: "Password updated successfully" });
  } catch (e) {
    console.error(e);
    return jsonError("Something went wrong", 500);
  }
}
