import { connectDB } from "@/lib/mongodb";
import { jsonError, jsonOk, readEmail } from "@/lib/api/auth-helpers";
import { toPublicUser } from "@/lib/api/user-public";
import { signAccessToken } from "@/lib/jwt-auth";
import { verifyPassword } from "@/lib/password";
import { User } from "@/models/User";
import { isEmail } from "@/lib/auth-validation";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = readEmail(body);
    const password = typeof body.password === "string" ? body.password : "";

    if (!email) {
      return jsonError("Email is required", 400);
    }
    if (!isEmail(email)) {
      return jsonError("Enter a valid email address", 400);
    }
    if (!password) {
      return jsonError("Password is required", 400);
    }

    await connectDB();
    const user = await User.findOne({ email });
    if (!user) {
      return jsonError("Incorrect email or password", 401);
    }

    const match = await verifyPassword(password, user.password);
    if (!match) {
      return jsonError("Incorrect email or password", 401);
    }

    const token = signAccessToken(String(user._id), user.email);
    return jsonOk({ token, user: toPublicUser(user) });
  } catch (e) {
    console.error(e);
    return jsonError("Something went wrong", 500);
  }
}
