import mongoose, { Schema } from "mongoose";

const idempotencyKeySchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
    responseBody: {
      type: Schema.Types.Mixed,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400, // 24-hour TTL index
    },
  },
  { timestamps: false }
);

export const IdempotencyKey =
  mongoose.models.IdempotencyKey ??
  mongoose.model("IdempotencyKey", idempotencyKeySchema);

export default IdempotencyKey;
