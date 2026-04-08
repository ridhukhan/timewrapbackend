import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";
import { io } from "../index.js";
// সব user দেখাও (নিজে ছাড়া)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Conversation create বা existing টা return করো
export const getOrCreateConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    let conversation = await Conversation.findOne({
      participants: { $all: [myId, userId] },
    }).populate("participants", "-password");

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [myId, userId],
      });
      conversation = await conversation.populate("participants", "-password");
    }

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Message পাঠাও
export const sendMessage = async (req, res) => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    const { conversationId, text } = req.body;
    const sender = req.user._id;

    let mediaUrl = "";
    let mediaType = "";

    if (req.file) {
      const isVideo = req.file.mimetype.startsWith("video");
      const resourceType = isVideo ? "video" : "image";

      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "social-app/messages", resource_type: resourceType },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      mediaUrl = uploadResult.secure_url;
      mediaType = isVideo ? "video" : "image";
    }

    const message = await Message.create({
      conversationId,
      sender,
      text,
      mediaUrl,
      mediaType,
    });

    // lastMessage update করো
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
    });
    const populated = await message.populate("sender", "name profilePic");
io.emit("newMessage", populated);

    // Socket.io দিয়ে real-time পাঠাবো পরে
    res.status(201).json(populated);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Messages গুলো আনো
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      conversationId,
      deletedFor: { $ne: myId },
    }).populate("sender", "name profilePic");

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Message delete করো
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const myId = req.user._id;

    await Message.findByIdAndUpdate(messageId, {
      $addToSet: { deletedFor: myId },
    });

    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
export const getConversationInfo = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const myId = req.user._id;

    const conversation = await Conversation.findById(conversationId)
      .populate("participants", "-password");

    // আমি ছাড়া অন্যজনকে return করো
    const otherUser = conversation.participants.find(
      (p) => p._id.toString() !== myId.toString()
    );

    res.status(200).json(otherUser);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};