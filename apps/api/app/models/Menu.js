import mongoose, { Schema } from "mongoose";

const menuItemSchema = new Schema(
  {
    label: { type: String, required: true },
    url: { type: String, required: true },
    type: {
      type: String,
      enum: ["custom", "category", "page", "brand", "consultation"],
      default: "custom",
    },
    ref: { type: String, default: "" },
    openInNewTab: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    children: [
      {
        label: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String, default: "custom" },
        ref: { type: String, default: "" },
        openInNewTab: { type: Boolean, default: false },
        status: { type: String, default: "active" },
      },
    ],
  },
  { _id: true }
);

const menuSchema = new Schema(
  {
    location: {
      type: String,
      required: true,
      unique: true,
      enum: ["header", "footer-1", "footer-2", "footer-3", "footer-4", "mobile"],
    },
    title: { type: String, required: true },
    items: [menuItemSchema],
  },
  { timestamps: true }
);

export const Menu =
  mongoose.models.Menu ?? mongoose.model("Menu", menuSchema);

export default Menu;
