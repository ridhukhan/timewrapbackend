import express from "express";
import {
  createPost,
  getFeedPosts,
  toggleLike,
  addComment,
  deletePost,
  getUserPosts,
} from "../controller/postController.js";
import protectRoute from "../middleware/protectroute.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/create", protectRoute, upload.single("media"), createPost);
router.get("/feed", protectRoute, getFeedPosts);
router.put("/like/:postId", protectRoute, toggleLike);
router.post("/comment/:postId", protectRoute, addComment);
router.delete("/:postId", protectRoute, deletePost);
router.get("/user/:userId", protectRoute, getUserPosts);
export default router;