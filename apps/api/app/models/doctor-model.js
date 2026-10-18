import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    degree: {
      type: String,
      trim: true,
    },
    contract_number: {
      type: Number,
      unique: true,
    },
    available_day: {
      type: String,
    },
    department: {
      type: String,
      trim: true,
    },
    specialty: {
      type: String,
      trim: true,
    },
    experience: {
      type: Number,
      min: 0,
    },
    hospital_name: {
      type: String,
      trim: true,
    },
    bmdc_number: {
      type: Number,
      unique: true,
    },
    consultation_fee: {
      type: Number,
      min: 0,
    },
    follow_up_fee: {
      type: Number,
      min: 0,
    },
    doctor_code: {
      type: String,
      unique: true,
      trim: true,
    },
    doctor_info: {
      type: String,
    },
    image: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);

export default Doctor;
