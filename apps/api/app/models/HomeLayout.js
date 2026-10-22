import mongoose, { Schema } from "mongoose";

const homeSectionSchema = new Schema(
  {
    key: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: [
        "hero_slider",
        "category_grid",
        "flash_deals",
        "product_rail",
        "banner_grid",
        "brand_carousel",
        "doctor_consultations",
        "testimonials",
        "features_ribbon",
        "custom_html",
      ],
    },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    enabled: { type: Boolean, default: true },
    config: { type: Schema.Types.Mixed, default: {} },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const homeLayoutSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "home",
    },
    sections: [homeSectionSchema],
  },
  { timestamps: true }
);

export const HomeLayout =
  mongoose.models.HomeLayout ??
  mongoose.model("HomeLayout", homeLayoutSchema);

export default HomeLayout;
