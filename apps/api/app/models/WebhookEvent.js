import mongoose, { Schema } from "mongoose";

const webhookEventSchema = new Schema(
  {
    provider: {
      type: String,
      required: true,
      index: true,
    },
    eventId: {
      type: String,
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      index: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ["received", "processed", "failed", "duplicate"],
      default: "received",
      index: true,
    },
    processedAt: {
      type: Date,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

webhookEventSchema.index({ provider: 1, eventId: 1 }, { unique: true });

export const WebhookEvent =
  mongoose.models.WebhookEvent ??
  mongoose.model("WebhookEvent", webhookEventSchema);

export default WebhookEvent;
