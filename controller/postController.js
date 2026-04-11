import Post from "../models/Post.js";
import { v2 as cloudinary } from "cloudinary";

// Post create
export const createPost = async (req, res) => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    const { caption, visibility } = req.body; // visibility add
    const author = req.user._id;

    let mediaUrl = "";
    let mediaType = "";

    if (req.file) {
      const isVideo = req.file.mimetype.startsWith("video");

      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "social-app/posts",
            resource_type: isVideo ? "video" : "image",
          },
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

    if (!caption && !mediaUrl) {
      return res.status(400).json({ message: "Post cannot be empty" });
    }

    const post = await Post.create({
      author,
      caption,
      mediaUrl,
      mediaType,
      visibility: visibility || "all", // visibility add
    });

    const populated = await post.populate("author", "name profilePic username");
    res.status(201).json(populated);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
// সব post আনো — latest first
export const getFeedPosts = async (req, res) => {
  try {
    const myId = req.user._id;

    // আমার friends বের করো
    const me = await User.findById(myId);
    const friendIds = me.following.filter((id) =>
      me.followers.map((f) => f.toString()).includes(id.toString())
    );

    const posts = await Post.find({
      $or: [
        { visibility: "all" },
        {
          visibility: "friends",
          author: { $in: [...friendIds, myId] },
        },
      ],
    })
      .populate("author", "name profilePic username")
      .populate("comments.user", "name profilePic username")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
// Like / Unlike toggle
export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.status(200).json({ likes: post.likes });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Comment add
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ user: userId, text });
    await post.save();

    const updated = await Post.findById(postId)
      .populate("author", "name profilePic username")
      .populate("comments.user", "name profilePic username");

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Post delete
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Specific user এর posts
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ author: userId })
      .populate("author", "name profilePic username")
      .populate("comments.user", "name profilePic username")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};