import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    defaultLocation: {
      type: {
        lat: Number,
        lng: Number,
      },
      default: null,
    },
    notificationRadius: {
      type: Number,
      default: 5, // Default radius in km
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password
userSchema.pre("save", async function (next) {
  const user = this;

  // Only hash the password if it's modified (or new)
  if (!user.isModified("password")) return next();

  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash the password
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

interface UserDocument extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  avatar: string;
  bio: string;
  address: string;
  phoneNumber: string;
  defaultLocation: { lat: number; lng: number } | null;
  notificationRadius: number;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export const User = mongoose.model<UserDocument>("User", userSchema);
