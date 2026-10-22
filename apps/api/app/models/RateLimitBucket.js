import mongoose, { Schema } from "mongoose";

const rateLimitBucketSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    count: {
      type: Number,
      default: 1,
    },
    resetAt: {
      type: Date,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// TTL index to automatically prune expired rate limit keys
rateLimitBucketSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RateLimitBucket =
  mongoose.models.RateLimitBucket ??
  mongoose.model("RateLimitBucket", rateLimitBucketSchema);

export default RateLimitBucket;
