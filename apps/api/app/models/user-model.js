import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    role: {
      type: String,
      enum: ["admin", "super-admin", "user", "manager"],
      default: "user",
      required: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    theme: {
      type: String,
      enum: ["system", "light", "dark"],
      default: "system",
    },
  },
  { timestamps: true }
);

userSchema.virtual("full_name").get(function () {
  return `${this.first_name} ${this.last_name}`;
});

if (process.env.NODE_ENV !== "production" && mongoose.models.User) {
  if (mongoose.models.User.schema?.paths?.username) {
    delete mongoose.models.User;
  }
}

export const User = mongoose.models.User ?? mongoose.model("User", userSchema);

export default User;

