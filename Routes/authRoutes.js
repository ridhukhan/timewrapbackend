import express from "express";
import {
  register,
  verifyOtp,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
} from "../controller/authController.js";
import protectRoute from "../middleware/protectroute.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protectRoute, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;