import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import Integration from "@/app/models/Integration";
import { encryptSecret, maskSecretsMap } from "@/lib/secrets";
import { getStaff, rankOf } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { invalidateIntegrationCache } from "@/lib/integrations/resolver";

export async function GET(request, context) {
  try {
    await connectMongo();
    const staff = await getStaff(request);
    if (!staff || rankOf(staff.role) < 2) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const params = await context.params;
    const key = params.key.trim().toLowerCase();

    const integration = await Integration.findOne({ key }).lean();
    if (!integration) {
      return NextResponse.json(
        { success: false, error: "Integration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        integration: {
          ...integration,
          secrets: maskSecretsMap(integration.secrets),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/integrations/[key] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch integration" },
      { status: 500 }
    );
  }
}

export async function PUT(request, context) {
  try {
    await connectMongo();
    const staff = await getStaff(request);
    if (!staff || rankOf(staff.role) < 3) {
      return NextResponse.json(
        { success: false, error: "Only super-administrators can update integration secrets" },
        { status: 403 }
      );
    }

    const params = await context.params;
    const key = params.key.trim().toLowerCase();
    const body = await request.json();

    const existing = await Integration.findOne({ key });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Integration not found" },
        { status: 404 }
      );
    }

    const updatedSecrets = { ...(existing.secrets || {}) };

    // Update only new secrets that are not masked placeholders
    if (body.secrets && typeof body.secrets === "object") {
      for (const [sKey, sVal] of Object.entries(body.secrets)) {
        if (sVal === null || sVal === "") {
          // Keep existing if blank (do not wipe out on save unless explicit flag)
          continue;
        }
        if (typeof sVal === "string" && sVal.startsWith("****")) {
          // Unchanged masked placeholder
          continue;
        }
        updatedSecrets[sKey] = encryptSecret(String(sVal));
      }
    }

    if (body.enabled !== undefined) existing.enabled = Boolean(body.enabled);
    if (body.mode) existing.mode = body.mode;
    if (body.config) existing.config = { ...existing.config, ...body.config };
    existing.secrets = updatedSecrets;
    existing.status = Object.keys(updatedSecrets).length > 0 ? "configured" : "unconfigured";
    existing.updatedBy = staff._id;

    await existing.save();
    invalidateIntegrationCache(key);

    await logAudit(
      staff,
      "update_integration",
      "Integration",
      key,
      `Updated settings for ${key}`,
      { enabled: existing.enabled, mode: existing.mode },
      request.headers.get("x-forwarded-for") || ""
    );

    return NextResponse.json(
      {
        success: true,
        integration: {
          ...existing.toObject(),
          secrets: maskSecretsMap(existing.secrets),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/integrations/[key] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update integration" },
      { status: 500 }
    );
  }
}
