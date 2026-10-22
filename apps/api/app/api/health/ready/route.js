import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectMongo from "@/services/mongo";
import logger from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const missingEnv = [];
  const mongoUri = process.env.MONGODB_CONNECTION_STRING || process.env.MONGO_URI;
  if (!mongoUri) missingEnv.push("MONGODB_CONNECTION_STRING / MONGO_URI");
  if (!process.env.AUTH_SECRET) missingEnv.push("AUTH_SECRET");

  if (missingEnv.length > 0) {
    logger.warn({ msg: "Health check failed: Missing required env vars", missing: missingEnv });
    return NextResponse.json(
      {
        status: "unhealthy",
        ready: false,
        error: "Missing required environment variables",
        missingEnv,
      },
      { status: 503 }
    );
  }

  try {
    await connectMongo();
    const adminDb = mongoose.connection.db.admin();
    
    // Ping MongoDB
    const pingResult = await adminDb.ping();
    if (!pingResult || pingResult.ok !== 1) {
      throw new Error("MongoDB ping did not return ok: 1");
    }

    // Check replica set status
    let replicaSet = { configured: false };
    try {
      const replStatus = await adminDb.command({ replSetGetStatus: 1 });
      replicaSet = {
        configured: true,
        ok: replStatus.ok === 1,
        set: replStatus.set,
        myState: replStatus.myState,
      };
    } catch (replErr) {
      // If connection string explicitly requires replicaSet and it's missing, treat as warning/unhealthy
      const expectsReplicaSet = mongoUri.includes("replicaSet=");
      replicaSet = {
        configured: false,
        expected: expectsReplicaSet,
        message: replErr.message,
      };
      if (expectsReplicaSet && process.env.NODE_ENV === "production") {
        throw new Error(`Replica set required but unreachable: ${replErr.message}`);
      }
    }

    return NextResponse.json(
      {
        status: "ready",
        ready: true,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: {
          connected: mongoose.connection.readyState === 1,
          ping: "ok",
          replicaSet,
        },
        services: {
          sentry: Boolean(process.env.SENTRY_DSN),
          email: Boolean(process.env.RESEND_API_KEY),
          bkash: Boolean(process.env.BKASH_APP_KEY),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error({ msg: "Health readiness probe failed", error: error.message });
    return NextResponse.json(
      {
        status: "unhealthy",
        ready: false,
        error: error.message || "Database connection failure",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
