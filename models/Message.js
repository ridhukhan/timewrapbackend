import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: { type: String, default: "" },
  mediaUrl: { type: String, default: "" },
  mediaType: { type: String, enum: ["image", "video", ""], default: "" },
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);
export default Message;