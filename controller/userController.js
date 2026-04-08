import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";

export const updateProfile = async (req, res) => {
  try {
    // ফাংশনের ভেতরে config করো — তখন dotenv already loaded
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    console.log("api_key:", process.env.CLOUDINARY_API_KEY);

    const { name, bio, username } = req.body;
    const userId = req.user._id;

    const updateData = {};
    if (name) updateData.name = name;
    if (bio) updateData.bio = bio;
    if (username) updateData.username = username;

    if (req.file) {
      if (req.user.profilePicPublicId) {
        await cloudinary.uploader.destroy(req.user.profilePicPublicId);
      }

      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "social-app/profiles" },
          (error, result) => {
            if (error) {
              console.log("Cloudinary error:", error);
              reject(error);
            } else {
              console.log("Success:", result.secure_url);
              resolve(result);
            }
          }
        );
        stream.end(req.file.buffer);
      });

      updateData.profilePic = uploadResult.secure_url;
      updateData.profilePicPublicId = uploadResult.public_id;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { returnDocument: "after" }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};