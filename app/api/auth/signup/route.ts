import { connectDB } from "@/lib/mongodb";
import { jsonError, jsonOk, readEmail } from "@/lib/api/auth-helpers";
import { toPublicUser } from "@/lib/api/user-public";
import { signAccessToken } from "@/lib/jwt-auth";
import { User } from "@/models/User";
import { isEmail } from "@/lib/auth-validation";

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(pw)) return "Password needs at least one uppercase letter";
  if (!/[0-9]/.test(pw)) return "Password needs at least one number";
  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = readEmail(body);
    const password = typeof body.password === "string" ? body.password : "";
    const confirm =
      typeof body.confirmPassword === "string" ? body.confirmPassword : "";

    if (!name) {
      return jsonError("Name is required", 400);
    }
    if (!email) {
      return jsonError("Email is required", 400);
    }
    if (!isEmail(email)) {
      return jsonError("Enter a valid email address", 400);
    }
    if (!password) {
      return jsonError("Password is required", 400);
    }
    const pwErr = validatePassword(password);
    if (pwErr) {
      return jsonError(pwErr, 400);
    }
    if (password !== confirm) {
      return jsonError("Passwords do not match", 400);
    }

    await connectDB();
    const existing = await User.findOne({ email });
    if (existing) {
      return jsonError("An account with this email already exists", 409);
    }

    const user = await User.create({ name, email, password });
    const token = signAccessToken(String(user._id), user.email);
    return jsonOk({ token, user: toPublicUser(user) }, 201);
  } catch (e) {
    console.error(e);
    return jsonError("Something went wrong", 500);
  }
}
