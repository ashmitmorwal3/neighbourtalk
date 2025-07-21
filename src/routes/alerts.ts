import express, { Request, Response } from "express";
import { Alert } from "../models/Alert";
import { User } from "../models/User";
import { authenticateToken } from "../middleware/auth";
import { ParsedQs } from "qs";

const router = express.Router();

// Get all alerts
router.get("/", async (req: any, res: Response): Promise<void> => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get alerts by proximity
router.get("/nearby", async (req: any, res: Response): Promise<void> => {
  try {
    const { lat, lng, radius = 5 } = req.query;

    if (!lat || !lng) {
      res.status(400).json({ message: "Location coordinates required" });
      return;
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const radiusInKm = parseFloat(radius as string);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusInKm)) {
      res.status(400).json({ message: "Invalid coordinates or radius" });
      return;
    }

    // Find alerts within the radius by comparing with coordinates field
    // Note: This is a simpler approach that doesn't require a geospatial index
    const alerts = await Alert.find().sort({ createdAt: -1 });

    // Haversine formula to calculate distance
    const userCoords = { lat: latitude, lng: longitude };

    // Filter alerts by distance
    const nearbyAlerts = alerts.filter((alert) => {
      if (
        !alert.coordinates ||
        !alert.coordinates.lat ||
        !alert.coordinates.lng
      )
        return false;

      // Calculate distance
      const R = 6371; // Earth's radius in km
      const dLat = ((userCoords.lat - alert.coordinates.lat) * Math.PI) / 180;
      const dLon = ((userCoords.lng - alert.coordinates.lng) * Math.PI) / 180;

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((alert.coordinates.lat * Math.PI) / 180) *
          Math.cos((userCoords.lat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      // Return true if alert is within radius
      return distance <= radiusInKm;
    });

    res.json(nearbyAlerts);
  } catch (error) {
    console.error("Error fetching nearby alerts:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new alert - requires authentication
router.post(
  "/",
  authenticateToken,
  async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }

      // Get user info to associate with the alert
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Create alert with user information
      const alertData = {
        ...req.body,
        user: userId,
        userName: user.name,
        userContact: user.phoneNumber || "",
      };

      const alert = new Alert(alertData);
      await alert.save();

      // Return the created alert
      res.status(201).json(alert);
    } catch (error) {
      console.error("Error creating alert:", error);
      res.status(400).json({ message: "Invalid data" });
    }
  }
);

// Get alerts created by the authenticated user
router.get(
  "/my-alerts",
  authenticateToken,
  async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }

      const alerts = await Alert.find({ user: userId }).sort({ createdAt: -1 });
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching user alerts:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Delete alert - only owner can delete
router.delete(
  "/:id",
  authenticateToken,
  async (req: any, res: Response): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }

      const userId = req.userId;
      const alertId = req.params.id;

      // Find the alert and verify ownership
      const alert = await Alert.findById(alertId);

      if (!alert) {
        res.status(404).json({ message: "Alert not found" });
        return;
      }

      // Check if the user is the owner of the alert
      if (alert.user.toString() !== userId) {
        res
          .status(403)
          .json({ message: "Not authorized to delete this alert" });
        return;
      }

      await Alert.findByIdAndDelete(alertId);
      res.status(200).json({ message: "Alert deleted" });
    } catch (error) {
      console.error("Error deleting alert:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export const alertRouter = router;
