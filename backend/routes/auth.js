import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { DriverProfile } from "../models/DriverProfile.js";

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || "fallback_secret",
    { expiresIn: "7d" }
  );
};

// POST /api/auth/register
export const register = async (req, res) => {
  // Check DB state before query
  if (process.env.NODE_ENV !== 'test' && !req.app.get('db_connected') && User.db.readyState !== 1) {
    return res.status(503).json({ error: "Database not connected. Please check server logs." });
  }

  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Default status for drivers is pending
    const status = role === "driver" ? "pending" : "active";

    const newUser = new User({
      name,
      email,
      phone,
      password, // In detailed impl, hash this!
      role: role || "customer",
      status,
    });

    await newUser.save();

    if (role === "driver") {
      // Create empty profile for driver
      const driverProfile = new DriverProfile({
        user: newUser._id,
        licenseNumber: `Unknown-${Date.now()}` // Placeholder, should be provided in separate step
      });
      await driverProfile.save();
    }

    const token = generateToken(newUser);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: "Email, password and role are required" });
    }

    const user = await User.findOne({ email });

    if (!user || user.password !== password) { // In real app, compare hash
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Role validation
    if (user.role !== role) {
      return res.status(403).json({ error: `You are not registered as a ${role}` });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: "Account suspended. Contact support." });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        status: user.status
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      console.warn("❌ Auth Server: User not found for ID:", req.user.id);
      return res.status(404).json({ error: "User not found" });
    }
    console.log("✅ Auth Server: getMe returning user:", user.email, "Role:", user.role);
    res.json(user);
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Keep existing OTP functions as mocks or implement if needed
export const sendOtp = (req, res) => {
  res.json({ message: "OTP feature pending", otp: "123456" });
};

export const verifyOtp = (req, res) => {
  res.json({ message: "OTP verified", verified: true });
};
