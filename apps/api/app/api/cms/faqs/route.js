import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import Faq from "@/app/models/Faq";
import FaqGroup from "@/app/models/FaqGroup";
import { sanitizeRichText } from "@/lib/sanitize";

export async function GET(request) {
  try {
    await connectMongo();
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("all") === "true";
    const groupId = searchParams.get("groupId");

    const query = includeInactive ? {} : { status: "active" };
    if (groupId) query.groupId = groupId;

    const faqs = await Faq.find(query)
      .populate("groupId", "title slug")
      .sort({ order: 1, createdAt: 1 })
      .lean();

    return NextResponse.json({ success: true, faqs }, { status: 200 });
  } catch (error) {
    console.error("GET /api/cms/faqs error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch FAQs" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectMongo();
    const body = await request.json();

    if (!body.question || !body.answer) {
      return NextResponse.json(
        { success: false, error: "Question and answer are required" },
        { status: 400 }
      );
    }

    const sanitizedAnswer = sanitizeRichText(body.answer);

    const faq = await Faq.create({
      ...body,
      answer: sanitizedAnswer,
      groupId: body.groupId || null,
      order: body.order != null ? Number(body.order) : 0,
    });

    return NextResponse.json({ success: true, faq }, { status: 201 });
  } catch (error) {
    console.error("POST /api/cms/faqs error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create FAQ" },
      { status: 500 }
    );
  }
}
