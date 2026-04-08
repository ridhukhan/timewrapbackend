// routes/userRoutes.js
import express from "express";
import { updateProfile, getUserProfile } from "../controller/userController.js";
import protectRoute from "../middleware/protectroute.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.put("/profile", protectRoute, upload.single("profilePic"), updateProfile);
router.get("/:username", getUserProfile);

export default router;