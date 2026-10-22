import mongoose, { Schema } from "mongoose";

const auditLogSchema = new Schema(
  {
    actor: {
      id: { type: Schema.Types.ObjectId, ref: "User", default: null },
      name: { type: String, default: "System" },
      email: { type: String, default: "" },
      role: { type: String, default: "system" },
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    entity: {
      type: String,
      required: true,
      index: true,
    },
    entityId: {
      type: String,
      default: "",
      index: true,
    },
    summary: {
      type: String,
      required: true,
    },
    diff: {
      type: Schema.Types.Mixed,
      default: null,
    },
    ip: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

export const AuditLog =
  mongoose.models.AuditLog ?? mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
