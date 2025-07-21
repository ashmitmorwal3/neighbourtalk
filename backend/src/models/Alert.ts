import mongoose, { Schema } from "mongoose";

// Define a GeoJSON schema for coordinates
const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Point"],
    default: "Point",
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
  },
});

const alertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  },
  location: {
    type: String,
    required: true,
  },
  // Add GeoJSON location field
  coordinates: {
    type: {
      lat: Number,
      lng: Number,
    },
    required: true,
  },
  radius: {
    type: Number,
    default: 5, // Default radius of 5km
  },
  // Reference to the user who created the alert
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // User's name who created the alert
  userName: {
    type: String,
    required: true,
  },
  // User's contact information (optional)
  userContact: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a geospatial index for location-based queries
alertSchema.index({ coordinates: "2dsphere" });

export const Alert = mongoose.model("Alert", alertSchema);
