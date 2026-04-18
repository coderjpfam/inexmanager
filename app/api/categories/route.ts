import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/api/require-auth-user";
import { connectDB } from "@/lib/mongodb";
import { v1Err } from "@/lib/api/v1-response";
import { transactionStatsByCategoryId } from "@/lib/categories/stats";
import { CategoryModel } from "@/models/Category";
import mongoose from "mongoose";

/** GET /api/categories — list with stats; POST — create (references/api.md § Categories). */
export async function GET(request: Request) {
  try {
    const auth = await requireAuthUser(request);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);
    const filter: Record<string, unknown> = { userId: uid };
    if (type === "income" || type === "expense") {
      filter.type = type;
    }

    const rows = await CategoryModel.find(filter).sort({ name: 1 }).lean();
    const stats = await transactionStatsByCategoryId(uid);

    const data = rows.map((c) => {
      const s = stats.get(String(c._id));
      return {
        _id: String(c._id),
        name: c.name,
        type: c.type,
        icon: c.icon ?? "📁",
        ...(c.color ? { color: c.color } : {}),
        isDefault: c.isDefault,
        transactionCount: s?.transactionCount ?? 0,
        totalAmount: s?.totalAmount ?? 0,
        createdAt: new Date(c.createdAt).toISOString(),
      };
    });

    return NextResponse.json({
      success: true as const,
      data,
      count: data.length,
    });
  } catch (e) {
    console.error(e);
    return v1Err("Something went wrong", 500, "INTERNAL_ERROR");
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuthUser(request);
    if (!auth.ok) return auth.response;

    const body = (await request.json()) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const type = body.type;
    const icon = typeof body.icon === "string" && body.icon.trim() ? body.icon.trim() : "📁";
    const color = typeof body.color === "string" && body.color.trim() ? body.color.trim() : undefined;

    if (!name) {
      return v1Err("name is required", 400, "VALIDATION", "name");
    }
    if (type !== "income" && type !== "expense") {
      return v1Err("type must be income or expense", 400, "VALIDATION", "type");
    }

    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);

    try {
      const doc = await CategoryModel.create({
        userId: uid,
        name,
        type,
        icon,
        color,
        isDefault: false,
      });
      const lean = doc.toObject();
      return NextResponse.json(
        {
          success: true as const,
          data: {
            _id: String(lean._id),
            name: lean.name,
            type: lean.type,
            icon: lean.icon ?? "📁",
            ...(lean.color ? { color: lean.color } : {}),
            isDefault: false,
            createdAt: new Date(lean.createdAt).toISOString(),
          },
        },
        { status: 201 },
      );
    } catch (err: unknown) {
      const code = err && typeof err === "object" && "code" in err ? (err as { code?: number }).code : undefined;
      if (code === 11000) {
        return v1Err("A category with this name already exists", 409, "CONFLICT");
      }
      throw err;
    }
  } catch (e) {
    console.error(e);
    return v1Err("Something went wrong", 500, "INTERNAL_ERROR");
  }
}
