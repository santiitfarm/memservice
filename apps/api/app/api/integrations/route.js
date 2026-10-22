import { NextResponse } from "next/server";
import connectMongo from "@/services/mongo";
import Integration from "@/app/models/Integration";
import { encryptSecret, maskSecretsMap } from "@/lib/secrets";
import { getStaff, rankOf } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(request) {
  try {
    await connectMongo();
    const staff = await getStaff(request);
    if (!staff || rankOf(staff.role) < 2) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const query = category ? { category } : {};

    const rawIntegrations = await Integration.find(query)
      .sort({ category: 1, key: 1 })
      .lean();

    const integrations = rawIntegrations.map((item) => ({
      _id: item._id,
      key: item.key,
      category: item.category,
      enabled: item.enabled,
      mode: item.mode,
      config: item.config || {},
      secrets: maskSecretsMap(item.secrets),
      status: item.status,
      lastTestedAt: item.lastTestedAt,
      lastError: item.lastError,
      updatedAt: item.updatedAt,
    }));

    return NextResponse.json({ success: true, integrations }, { status: 200 });
  } catch (error) {
    console.error("GET /api/integrations error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch integrations" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectMongo();
    const staff = await getStaff(request);
    if (!staff || rankOf(staff.role) < 3) {
      return NextResponse.json(
        { success: false, error: "Only super-administrators can configure integrations" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { key, category, enabled, mode, config = {}, secrets = {} } = body;

    if (!key || !category) {
      return NextResponse.json(
        { success: false, error: "Integration key and category are required" },
        { status: 400 }
      );
    }

    const cleanKey = key.trim().toLowerCase();
    const existing = await Integration.findOne({ key: cleanKey });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Integration already exists" },
        { status: 409 }
      );
    }

    // Encrypt each provided secret
    const encryptedSecrets = {};
    for (const [sKey, sVal] of Object.entries(secrets)) {
      if (sVal && typeof sVal === "string" && !sVal.startsWith("****")) {
        encryptedSecrets[sKey] = encryptSecret(sVal);
      }
    }

    const integration = await Integration.create({
      key: cleanKey,
      category,
      enabled: Boolean(enabled),
      mode: mode || "sandbox",
      config,
      secrets: encryptedSecrets,
      status: Object.keys(encryptedSecrets).length > 0 ? "configured" : "unconfigured",
      updatedBy: staff._id,
    });

    await logAudit(
      staff,
      "create_integration",
      "Integration",
      integration.key,
      `Created integration ${integration.key} in ${integration.category}`,
      { enabled: integration.enabled, mode: integration.mode },
      request.headers.get("x-forwarded-for") || ""
    );

    return NextResponse.json(
      {
        success: true,
        integration: {
          ...integration.toObject(),
          secrets: maskSecretsMap(integration.secrets),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/integrations error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create integration" },
      { status: 500 }
    );
  }
}
