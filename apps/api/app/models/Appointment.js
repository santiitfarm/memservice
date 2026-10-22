import mongoose, { Schema } from "mongoose";

const appointmentSchema = new Schema(
  {
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },
    patient: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },
      age: {
        type: Number,
        min: 0,
      },
      gender: {
        type: String,
        enum: ["male", "female", "other"],
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
    },
    preferredDate: {
      type: Date,
      required: true,
      index: true,
    },
    preferredSlot: {
      type: String,
      default: "morning",
    },
    notes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: [
        "requested",
        "confirmed",
        "rescheduled",
        "completed",
        "cancelled",
        "no_show",
      ],
      default: "requested",
      index: true,
    },
    feeSnapshot: {
      consultation: {
        type: Number,
        default: 0,
      },
      followUp: {
        type: Number,
        default: 0,
      },
    },
    source: {
      type: String,
      default: "storefront",
    },
    staffNotes: {
      type: String,
      default: "",
    },
    history: [
      {
        status: { type: String },
        note: { type: String, default: "" },
        changedBy: { type: String, default: "system" },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({ "patient.phone": 1, createdAt: -1 });
appointmentSchema.index({ doctor: 1, preferredDate: 1 });

export const Appointment =
  mongoose.models.Appointment ??
  mongoose.model("Appointment", appointmentSchema);

export default Appointment;
