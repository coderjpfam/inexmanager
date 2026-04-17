import { requireAuthUser } from "@/lib/api/require-auth-user";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { v1Err } from "@/lib/api/v1-response";
import { CategoryModel } from "@/models/Category";
import mongoose from "mongoose";

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
    const data = rows.map((c) => ({
      _id: String(c._id),
      name: c.name,
      type: c.type,
      icon: c.icon ?? "📁",
      color: c.color,
      isDefault: c.isDefault,
      createdAt: new Date(c.createdAt).toISOString(),
    }));

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
