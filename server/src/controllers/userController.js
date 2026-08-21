import { clerkClient, getAuth } from "@clerk/express";
import User from "../models/User.js";

export const syncUser = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const clerkUser = await clerkClient.users.getUser(userId);

    const name =
      [clerkUser.firstName, clerkUser.lastName]
        .filter(Boolean)
        .join(" ") || "User";

    const email = clerkUser.primaryEmailAddress?.emailAddress;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "User email not found",
      });
    }

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      {
        $set: {
          name,
          email,
          avatarUrl: clerkUser.imageUrl || null,
          lastLoginAt: new Date(),
        },
        $setOnInsert: {
          clerkId: userId,
          role: "student",
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "User synced successfully",
      user,
    });
  } catch (error) {
    console.error("Sync user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to sync user",
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["student", "instructor"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        role,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Role updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update role error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update role",
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get current user",
    });
  }
};