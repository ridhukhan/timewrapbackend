import User from "../models/User.js";

// Follow / Unfollow toggle
export const toggleFollow = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    if (userId === myId.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(userId);
    const me = await User.findById(myId);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = me.following.includes(userId);

    if (isFollowing) {
      // Unfollow
      me.following = me.following.filter((id) => id.toString() !== userId);
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== myId.toString()
      );
    } else {
      // Follow
      me.following.push(userId);
      targetUser.followers.push(myId);
    }

    await me.save();
    await targetUser.save();

    // Friend check — দুজনই দুজনকে follow করলে friend
    const isFriend =
      me.following.includes(userId) &&
      me.followers.includes(userId);

    res.status(200).json({
      following: me.following,
      followers: me.followers,
      isFriend,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// User profile দেখো — follow info সহ
export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const myId = req.user._id;

    const user = await User.findOne({ username })
      .select("-password")
      .populate("followers", "name profilePic username")
      .populate("following", "name profilePic username");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = user.followers.some(
      (f) => f._id.toString() === myId.toString()
    );

    const isFriend =
      user.followers.some((f) => f._id.toString() === myId.toString()) &&
      user.following.some((f) => f._id.toString() === myId.toString());

    res.status(200).json({
      ...user.toObject(),
      isFollowing,
      isFriend,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// আমার followers/following list
export const getFollowInfo = async (req, res) => {
  try {
    const myId = req.user._id;
    const user = await User.findById(myId)
      .select("followers following")
      .populate("followers", "name profilePic username")
      .populate("following", "name profilePic username");

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getFollowList = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type } = req.query; // "followers" or "following"

    const user = await User.findById(userId)
      .populate("followers", "name profilePic username bio followers following")
      .populate("following", "name profilePic username bio followers following");

    if (!user) return res.status(404).json({ message: "User not found" });

    const list = type === "followers" ? user.followers : user.following;
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};