import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import Menu from "@/app/models/Menu";

export async function GET() {
  try {
    await connectMongo();
    const menus = await Menu.find({}).lean();
    return NextResponse.json({ success: true, menus }, { status: 200 });
  } catch (error) {
    console.error("GET /api/cms/menus error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch menus" },
      { status: 500 }
    );
  }
}
