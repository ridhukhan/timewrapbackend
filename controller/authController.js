import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import transporter from "../config/nodemailer.js";
import getTransporter from "../config/nodemailer.js";
const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const sendOtpEmail = async (email, otp) => {
  
  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"Social App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#18181b;border-radius:16px;color:#fff">
        <h2 style="color:#38bdf8;margin-bottom:8px">Email Verification</h2>
        <p style="color:#a1a1aa;margin-bottom:24px">Use the OTP below to verify your account.</p>
        <div style="background:#27272a;border-radius:12px;padding:24px;text-align:center;letter-spacing:12px;font-size:36px;font-weight:bold;color:#38bdf8">
          ${otp}
        </div>
        <p style="color:#52525b;font-size:13px;margin-top:24px;text-align:center">
          This OTP expires in 10 minutes. Do not share it with anyone.
        </p>
      </div>
    `,
  });
};

const sendResetEmail = async (email, resetUrl) => {
 
  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"Social App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset your password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#18181b;border-radius:16px;color:#fff">
        <h2 style="color:#38bdf8;margin-bottom:8px">Reset Password</h2>
        <p style="color:#a1a1aa;margin-bottom:24px">Click the button below to reset your password.</p>
        <a href="${resetUrl}" style="display:block;background:#38bdf8;color:#000;text-align:center;padding:14px;border-radius:12px;font-weight:bold;text-decoration:none;font-size:15px">
          Reset Password
        </a>
        <p style="color:#52525b;font-size:13px;margin-top:24px;text-align:center">
          This link expires in 15 minutes. If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  });
};

// Register
export const register = async (req, res) => {
  try {
      console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

    const { name, email, password, username } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      username,
      verifyOtp: otp,
      verifyOtpExpiry: otpExpiry,
    });

    await sendOtpEmail(email, otp);

    res.status(201).json({
      message: "OTP sent to your email",
      userId: user._id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Already verified" });
    }

    if (user.verifyOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > user.verifyOtpExpiry) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.isVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpiry = null;
    await user.save();

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      profilePic: user.profilePic,
      bio: user.bio,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify your email first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      profilePic: user.profilePic,
      bio: user.bio,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Logout
export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out" });
};

// GetMe
export const getMe = async (req, res) => {
  res.status(200).json(req.user);
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account with this email" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    user.resetPasswordToken = token;
    user.resetPasswordExpiry = expiry;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await sendResetEmail(email, resetUrl);

    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({ resetPasswordToken: token });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    if (new Date() > user.resetPasswordExpiry) {
      return res.status(400).json({ message: "Token expired" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = "";
    user.resetPasswordExpiry = null;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};