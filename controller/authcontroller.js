import { User } from "../model/usermodel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


// ✅ REGISTER
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hash,
    });

    res.json({ message: "Register success" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 🔥 COOKIE SET
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,      
        sameSite: "None",    
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      .json({
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ LOGOUT
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,     // same as login
    sameSite: "None"
  });

  res.json({ message: "Logout success" });
};