import { Router } from "express";
import { DriverProfile } from "../models/DriverProfile.js";
import { User } from "../models/User.js";
import { verifyToken } from "../middleware/auth.js";
import { checkRole } from "../middleware/role.js";

const router = Router();

// Middleware to ensure user is a driver
const driverMiddleware = [verifyToken, checkRole(["driver"])];

// GET /api/driver/profile
router.get("/profile", driverMiddleware, async (req, res) => {
    try {
        const profile = await DriverProfile.findOne({ user: req.user.id }).populate("user", "-password");
        if (!profile) {
            return res.status(404).json({ error: "Driver profile not found" });
        }

        // Migration/Initialization: Ensure persistent fields exist
        let updated = false;
        if (!profile.earnings) {
            profile.earnings = { today: 0, week: 0, month: 0, total: 0 };
            updated = true;
        }
        if (profile.walletBalance === undefined) {
            profile.walletBalance = 0;
            updated = true;
        }
        if (profile.totalEarnings === undefined) {
            profile.totalEarnings = 0;
            updated = true;
        }
        if (updated) {
            await profile.save();
        }

        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

// PUT /api/driver/status - Toggle Online/Offline
router.put("/status", driverMiddleware, async (req, res) => {
    try {
        const { isOnline } = req.body;
        const profile = await DriverProfile.findOne({ user: req.user.id });

        if (!profile) {
            return res.status(404).json({ error: "Driver profile not found" });
        }

        // Check if driver is approved before going online
        const user = await User.findById(req.user.id);
        if (isOnline && user.status !== "active") {
            return res.status(403).json({ error: "Account not active. Please wait for admin approval." });
        }

        profile.isOnline = isOnline;
        await profile.save();

        res.json({ message: "Status updated", isOnline: profile.isOnline });
    } catch (error) {
        res.status(500).json({ error: "Failed to update status" });
    }
});

// PUT /api/driver/location - Update real-time location
router.put("/location", driverMiddleware, async (req, res) => {
    try {
        const { lat, lng } = req.body;

        if (!lat || !lng) return res.status(400).json({ error: "Invalid location" });

        await DriverProfile.findOneAndUpdate(
            { user: req.user.id },
            {
                currentLocation: {
                    lat,
                    lng,
                    lastUpdated: new Date()
                }
            }
        );

        res.json({ message: "Location updated" });
    } catch (error) {
        res.status(500).json({ error: "Failed to update location" });
    }
});

export { router as driverRoutes };
