import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import {
  sendMetaEvent,
  SUPPORTED_META_EVENTS,
} from "@/lib/integrations/tracking/meta";

export async function POST(request) {
  const limited = rateLimit(request, "public-tracking", {
    limit: 120,
    windowMs: 60 * 1000,
  });
  if (limited) return limited;

  try {
    const body = await request.json().catch(() => ({}));
    const { eventName, eventId, eventSourceUrl, userData, customData } = body;

    if (!eventName || !SUPPORTED_META_EVENTS.includes(eventName)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid eventName "${eventName}". Supported events: ${SUPPORTED_META_EVENTS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const result = await sendMetaEvent({
      eventName,
      eventId,
      eventSourceUrl,
      userData: userData || {},
      customData: customData || {},
      request,
    });

    return NextResponse.json({
      success: true,
      eventId: result.eventId,
      dispatched: result.success,
      skipped: result.skipped || false,
    });
  } catch (error) {
    console.error("POST /api/track error:", error);
    return NextResponse.json(
      { success: false, error: "Tracking request failed" },
      { status: 500 }
    );
  }
}
