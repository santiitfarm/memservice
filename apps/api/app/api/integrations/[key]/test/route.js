import { NextResponse } from "next/server";
import { getStaff, rankOf } from "@/lib/auth";
import { getPaymentAdapter } from "@/lib/integrations/payments";
import { getIntegration } from "@/lib/integrations/resolver";
import { Resend } from "resend";

export async function POST(request, context) {
  try {
    const staff = await getStaff(request);
    if (!staff || rankOf(staff.role) < 2) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const params = await context.params;
    const key = params.key.trim().toLowerCase();

    // 1. Payment Gateway Adapters
    const adapter = getPaymentAdapter(key);
    if (adapter && typeof adapter.test === "function") {
      const result = await adapter.test();
      return NextResponse.json({ success: result.ok, result }, { status: 200 });
    }

    // 2. Resend Email Integration
    if (key === "resend") {
      const integration = await getIntegration("resend");
      const apiKey = integration?.secrets?.apiKey || process.env.RESEND_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { success: false, result: { ok: false, error: "Resend API key is not configured" } },
          { status: 200 }
        );
      }

      const resend = new Resend(apiKey);
      try {
        const { data, error } = await resend.apiKeys.list();
        if (error) {
          return NextResponse.json(
            { success: false, result: { ok: false, error: error.message || String(error) } },
            { status: 200 }
          );
        }
        return NextResponse.json(
          { success: true, result: { ok: true, message: "Resend API credentials verified successfully" } },
          { status: 200 }
        );
      } catch (err) {
        return NextResponse.json(
          { success: false, result: { ok: false, error: err.message } },
          { status: 200 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: `No test runner available for integration "${key}"` },
      { status: 400 }
    );
  } catch (error) {
    console.error("POST /api/integrations/[key]/test error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to test integration" },
      { status: 500 }
    );
  }
}
