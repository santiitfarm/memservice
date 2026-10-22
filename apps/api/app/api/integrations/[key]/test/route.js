import { NextResponse } from "next/server";
import { getStaff, rankOf } from "@/lib/auth";
import { getPaymentAdapter } from "@/lib/integrations/payments";
import { getCourierAdapter } from "@/lib/integrations/couriers";
import { getIntegration } from "@/lib/integrations/resolver";
import googleAuthAdapter from "@/lib/integrations/auth/google";
import cloudinaryAdapter from "@/lib/integrations/media/cloudinary";
import { sendMetaEvent } from "@/lib/integrations/tracking/meta";
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
    const paymentAdapter = getPaymentAdapter(key);
    if (paymentAdapter && typeof paymentAdapter.test === "function") {
      const result = await paymentAdapter.test();
      return NextResponse.json({ success: result.ok, result }, { status: 200 });
    }

    // 2. Courier Logistics Adapters
    const courierAdapter = getCourierAdapter(key);
    if (courierAdapter && typeof courierAdapter.test === "function") {
      const result = await courierAdapter.test();
      return NextResponse.json({ success: result.ok, result }, { status: 200 });
    }

    // 3. Resend Email Integration
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

    // 4. Cloudinary Media Integration
    if (key === "cloudinary") {
      const result = await cloudinaryAdapter.test();
      return NextResponse.json({ success: result.ok, result }, { status: 200 });
    }

    // 5. Google OAuth Integration
    if (key === "google_oauth" || key === "google-auth" || key === "google") {
      const result = await googleAuthAdapter.test();
      return NextResponse.json({ success: result.ok, result }, { status: 200 });
    }

    // 6. Meta Conversions API
    if (key === "meta_capi" || key === "meta-capi" || key === "meta") {
      const integration = await getIntegration("meta_capi");
      const pixelId = integration?.config?.pixelId || process.env.META_PIXEL_ID;
      const accessToken = integration?.secrets?.accessToken || process.env.META_ACCESS_TOKEN;

      if (!pixelId || !accessToken) {
        return NextResponse.json(
          { success: false, result: { ok: false, error: "Meta Pixel ID or Access Token not configured" } },
          { status: 200 }
        );
      }

      const testRes = await sendMetaEvent({
        eventName: "PageView",
        eventId: `TEST-${Date.now()}`,
        userData: { email: "test@memservice.com" },
      });

      return NextResponse.json(
        {
          success: testRes.success,
          result: {
            ok: testRes.success,
            message: testRes.success
              ? "Meta CAPI test event received successfully"
              : testRes.error,
          },
        },
        { status: 200 }
      );
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
