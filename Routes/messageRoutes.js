import express from "express";
import {
  getAllUsers,
  getOrCreateConversation,
  sendMessage,
  getMessages,
  deleteMessage,
  getConversationInfo,
} from "../controller/messageController.js"
import protectRoute from "../middleware/protectroute.js"
import upload from "../middleware/upload.js"

const router = express.Router();

router.get("/users", protectRoute, getAllUsers);
router.get("/conversation/:userId", protectRoute, getOrCreateConversation);
router.get("/:conversationId/messages", protectRoute, getMessages);
router.post("/send", protectRoute, upload.single("media"), sendMessage);
router.delete("/:messageId", protectRoute, deleteMessage);
router.get("/conversation-info/:conversationId", protectRoute, getConversationInfo);
export default router;