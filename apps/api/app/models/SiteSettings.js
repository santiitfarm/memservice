import mongoose, { Schema } from "mongoose";

const siteSettingsSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "site",
    },
    siteName: {
      type: String,
      required: true,
      default: "Mem Service",
    },
    tagline: {
      type: String,
      default: "Genuine Medicines, Healthcare & Consultations Across Bangladesh",
    },
    logoLight: {
      type: String,
      default: "/assets/logo/logo.png",
    },
    logoDark: {
      type: String,
      default: "/assets/logo/logo.png",
    },
    favicon: {
      type: String,
      default: "/favicon.ico",
    },
    contact: {
      phone: { type: String, default: "+8801711655686" },
      whatsapp: { type: String, default: "+8801711655686" },
      email: { type: String, default: "support@memservice.com" },
      address: {
        type: String,
        default: "Suite #402, Sena Kalyan Bhaban, Motijheel C/A, Dhaka-1000",
      },
      mapUrl: { type: String, default: "" },
      workingHours: { type: String, default: "9:00 AM - 10:00 PM (Daily)" },
    },
    social: {
      facebook: { type: String, default: "https://facebook.com/memservice" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
      tiktok: { type: String, default: "" },
      x: { type: String, default: "" },
      linkedin: { type: String, default: "" },
    },
    seo: {
      defaultTitle: {
        type: String,
        default: "Mem Service - Healthcare, Medicines & Consultations in Bangladesh",
      },
      titleTemplate: { type: String, default: "%s | Mem Service" },
      defaultDescription: {
        type: String,
        default:
          "Order genuine prescription medicines, OTC health products, and book verified specialist doctor consultations online across Bangladesh.",
      },
      ogImage: { type: String, default: "/assets/logo/logo.png" },
    },
    header: {
      topBarText: {
        type: String,
        default: "Express delivery inside Dhaka within 24 hours | Call +8801711655686",
      },
      showSearch: { type: Boolean, default: true },
      showThemeToggle: { type: Boolean, default: true },
    },
    footer: {
      about: {
        type: String,
        default:
          "Mem Service provides authentic medicines, healthcare items, and telemedicine consultations with licensed physicians throughout Bangladesh.",
      },
      copyrightText: {
        type: String,
        default: "Mem Service. All rights reserved.",
      },
      showPaymentBadges: { type: Boolean, default: true },
    },
    announcement: {
      text: { type: String, default: "" },
      link: { type: String, default: "" },
      enabled: { type: Boolean, default: false },
    },
    maintenance: {
      enabled: { type: Boolean, default: false },
      message: {
        type: String,
        default: "We are currently undergoing scheduled maintenance. Please check back shortly.",
      },
    },
  },
  { timestamps: true }
);

export const SiteSettings =
  mongoose.models.SiteSettings ??
  mongoose.model("SiteSettings", siteSettingsSchema);

export default SiteSettings;
