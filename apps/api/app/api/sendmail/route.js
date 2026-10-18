import { sendMail } from "@/lib/mailer";
import { NextResponse } from "next/server";

// Staff-only (enforced in middleware.js): sends an arbitrary email through Resend.
// Public/transactional emails are sent server-side by their own routes.
export async function POST(request) {
  try {
    const { to, subject, text, html } = await request.json();

    if (!to || !subject || (!text && !html)) {
      return NextResponse.json(
        {
          error:
            "Recipient, subject, and either text or HTML content are required.",
        },
        { status: 400 }
      );
    }

    const result = await sendMail({ to, subject, text, html });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || "Failed to send email." },
        { status: result.skipped ? 503 : 502 }
      );
    }
    return NextResponse.json({ message: "Email sent successfully!", id: result.id });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email. Please try again later." },
      { status: 500 }
    );
  }
}
