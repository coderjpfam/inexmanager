import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/api/require-auth-user";
import { connectDB } from "@/lib/mongodb";
import { v1Err } from "@/lib/api/v1-response";
import { CategoryModel } from "@/models/Category";
import { TransactionModel } from "@/models/Transaction";
import mongoose from "mongoose";

type RouteCtx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: RouteCtx) {
  try {
    const auth = await requireAuthUser(request);
    if (!auth.ok) return auth.response;

    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) {
      return v1Err("Not found", 404, "NOT_FOUND");
    }

    const body = (await request.json()) as Record<string, unknown>;
    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);
    const c = await CategoryModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: uid,
    });
    if (!c) return v1Err("Not found", 404, "NOT_FOUND");

    if (typeof body.name === "string" && body.name.trim()) {
      c.name = body.name.trim();
    }
    if (typeof body.icon === "string") {
      c.icon = body.icon.trim() || "📁";
    }
    if (typeof body.color === "string") {
      c.color = body.color.trim() || undefined;
    }
    if (body.type === "income" || body.type === "expense") {
      c.type = body.type;
    }

    try {
      await c.save();
    } catch (err: unknown) {
      const code = err && typeof err === "object" && "code" in err ? (err as { code?: number }).code : undefined;
      if (code === 11000) {
        return v1Err("A category with this name already exists", 409, "CONFLICT");
      }
      throw err;
    }

    return NextResponse.json({
      success: true as const,
      data: {
        _id: String(c._id),
        name: c.name,
        icon: c.icon,
        ...(c.color ? { color: c.color } : {}),
      },
    });
  } catch (e) {
    console.error(e);
    return v1Err("Something went wrong", 500, "INTERNAL_ERROR");
  }
}

export async function DELETE(_request: Request, ctx: RouteCtx) {
  try {
    const auth = await requireAuthUser(_request);
    if (!auth.ok) return auth.response;

    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) {
      return v1Err("Not found", 404, "NOT_FOUND");
    }

    await connectDB();
    const uid = new mongoose.Types.ObjectId(auth.userId);
    const oid = new mongoose.Types.ObjectId(id);

    const c = await CategoryModel.findOne({ _id: oid, userId: uid });
    if (!c) return v1Err("Not found", 404, "NOT_FOUND");

    const txCount = await TransactionModel.countDocuments({
      userId: uid,
      categoryId: oid,
    });
    if (txCount > 0) {
      return v1Err("Cannot delete category with linked transactions", 409, "CONFLICT");
    }

    await CategoryModel.deleteOne({ _id: oid, userId: uid });

    return NextResponse.json({
      success: true as const,
      message: "Category deleted",
      data: { _id: id },
    });
  } catch (e) {
    console.error(e);
    return v1Err("Something went wrong", 500, "INTERNAL_ERROR");
  }
}
