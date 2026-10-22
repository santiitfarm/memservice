import mongoose, { Schema } from "mongoose";

const customerProfileSchema = new Schema(
  {
    customer_name: { type: String, required: true },
    phone_number: { type: String, sparse: true, index: true },
    email: { type: String, sparse: true, index: true },
    googleId: { type: String, sparse: true, index: true },
    image: { type: String, default: "" },
    authProvider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    address: { type: String },
    password: { type: String },
    orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
    others: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
  },
  { timestamps: true }
);

customerProfileSchema.index({
  customer_name: "text",
  createdAt: -1,
  phone_number: "text",
  email: "text",
});
export const CustomerProfile =
  mongoose.models.CustomerProfile ??
  mongoose.model("CustomerProfile", customerProfileSchema);

// write a custom function tp calculate total spent of all users in order
