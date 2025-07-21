import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const TOKEN_EXPIRY = "7d"; // Token valid for 7 days

// Register a new user
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
    });

    await user.save();

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "default_secret",
      {
        expiresIn: "1d",
      }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Return user info
    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Server error during registration",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Login user
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || JWT_SECRET,
      {
        expiresIn: TOKEN_EXPIRY,
      }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Return user data (excluding password) and token
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        address: user.address,
        phoneNumber: user.phoneNumber,
        defaultLocation: user.defaultLocation,
        notificationRadius: user.notificationRadius,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Get current user profile
router.get(
  "/profile",
  authenticateToken,
  async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }

      const user = await User.findById(userId).select("-password");
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.status(200).json(user);
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ message: "Server error fetching profile" });
    }
  }
);

// Update user profile
router.put(
  "/profile",
  authenticateToken,
  async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }

      const {
        name,
        bio,
        address,
        phoneNumber,
        defaultLocation,
        notificationRadius,
        avatar,
      } = req.body;

      // Find and update user
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            name,
            bio,
            address,
            phoneNumber,
            defaultLocation,
            notificationRadius,
            avatar,
          },
        },
        { new: true }
      ).select("-password");

      if (!updatedUser) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Server error updating profile" });
    }
  }
);

// Change password
router.put(
  "/change-password",
  authenticateToken,
  async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      // Get user with password
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        res.status(400).json({ message: "Current password is incorrect" });
        return;
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Server error changing password" });
    }
  }
);

export const authRouter = router;
