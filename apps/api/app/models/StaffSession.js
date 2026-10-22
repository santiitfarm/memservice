import mongoose, { Schema } from "mongoose";

const staffSessionSchema = new Schema(
  {
    jti: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    ip: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
    revokedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

staffSessionSchema.index({ user: 1, revokedAt: 1 });

export const StaffSession =
  mongoose.models.StaffSession ?? mongoose.model("StaffSession", staffSessionSchema);

export default StaffSession;
