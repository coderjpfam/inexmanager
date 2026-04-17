import { connectDB } from "@/lib/mongodb";
import { jsonError, jsonOk, readEmail } from "@/lib/api/auth-helpers";
import { signPasswordResetToken } from "@/lib/jwt-auth";
import { sendPasswordResetEmail } from "@/lib/mail";
import { User } from "@/models/User";
import { isEmail } from "@/lib/auth-validation";

const GENERIC =
  "If an account exists for that email, you will receive reset instructions shortly.";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = readEmail(body);

    if (!email) {
      return jsonError("Email is required", 400);
    }
    if (!isEmail(email)) {
      return jsonError("Enter a valid email address", 400);
    }

    await connectDB();
    const user = await User.findOne({ email });
    if (user) {
      const token = signPasswordResetToken(String(user._id), user.email);
      await sendPasswordResetEmail(user.email, token);
    }

    return jsonOk({ message: GENERIC });
  } catch (e) {
    console.error(e);
    return jsonError("Something went wrong", 500);
  }
}
