import { getAuth } from "@clerk/express";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findOne({
      clerkId: userId,
      isActive: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "QuizForge user not found",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Protect middleware error:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      });
    }

    next();
  };
};