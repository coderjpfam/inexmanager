import { connectDB } from "@/lib/mongodb";
import { jsonError, jsonOk } from "@/lib/api/auth-helpers";
import { toPublicUser } from "@/lib/api/user-public";
import { verifyAccessToken } from "@/lib/jwt-auth";
import { User } from "@/models/User";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const auth = request.headers.get("authorization");
    const token =
      typeof body.token === "string"
        ? body.token
        : auth?.startsWith("Bearer ")
          ? auth.slice(7)
          : "";

    if (!token) {
      return jsonError("Token is required", 400);
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      return jsonError("Invalid or expired token", 401);
    }

    await connectDB();
    const user = await User.findOne({
      _id: payload.sub,
      email: payload.email,
    });
    if (!user) {
      return jsonError("Invalid or expired token", 401);
    }

    return jsonOk({ user: toPublicUser(user) });
  } catch (e) {
    console.error(e);
    return jsonError("Something went wrong", 500);
  }
}
