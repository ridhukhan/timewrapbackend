import express from "express";
import {
  toggleFollow,
  getUserProfile,
  getFollowInfo,
  getFollowList,
} from "../controller/followController.js";
import protectRoute from "../middleware/protectroute.js";

const router = express.Router();

router.post("/toggle/:userId", protectRoute, toggleFollow);
router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/info", protectRoute, getFollowInfo);
router.get("/list/:userId", protectRoute, getFollowList);
export default router;