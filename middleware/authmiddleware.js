import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    // ✅ Cookie theke token nebo
    const token = req.cookies?.token;

    if (!token) {
      req.user = null;
      return next();
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ req.user set
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();

  } catch (error) {
    // ❌ Invalid token hole safe fallback
    req.user = null;
    next();
  }
};