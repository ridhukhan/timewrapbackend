import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: "" },
  profilePicPublicId: { type: String, default: "" },
  bio: { type: String, default: "" },
  username: { type: String, unique: true },

  // Email verification
  isVerified: { type: Boolean, default: false },
  verifyOtp: { type: String, default: "" },
  verifyOtpExpiry: { type: Date, default: null },

  // Forgot password
  resetPasswordToken: { type: String, default: "" },
  resetPasswordExpiry: { type: Date, default: null },

}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;