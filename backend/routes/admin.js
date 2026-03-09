import { Router } from "express";
import { User } from "../models/User.js";
import { DriverProfile } from "../models/DriverProfile.js";
import { Ride } from "../models/Ride.js";
import { AppConfig } from "../models/AppConfig.js";
import { verifyToken } from "../middleware/auth.js";
import { checkRole } from "../middleware/role.js";

const router = Router();

// Middleware to ensure user is admin
const adminMiddleware = [verifyToken, checkRole(["admin"])];

// GET /api/admin/stats - High level overview
router.get("/stats", adminMiddleware, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: "customer" });
        const activeDriversCount = await User.countDocuments({ role: "driver", status: "active" });
        const onlineDriversCount = await DriverProfile.countDocuments({ isOnline: true, user: { $in: await User.find({ status: "active" }).distinct("_id") } });

        // Revenue aggregate (commission portion)
        let config = await AppConfig.findOne({ key: "global" });
        const commissionFactor = config ? (config.commission.percentage / 100) : 0.2;

        const completedRides = await Ride.find({ status: "completed" });
        const totalRevenue = completedRides.reduce((sum, ride) => sum + (ride.fare * commissionFactor), 0);

        res.json({
            totalUsers,
            activeDrivers: onlineDriversCount,
            totalRevenue: Math.round(totalRevenue),
            totalRides: completedRides.length
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});

// GET /api/admin/drivers - List all drivers with their profiles
router.get("/drivers", adminMiddleware, async (req, res) => {
    try {
        const drivers = await User.find({ role: "driver" }).select("-password");
        const driversWithProfiles = await Promise.all(drivers.map(async (driver) => {
            const profile = await DriverProfile.findOne({ user: driver._id }).populate('vehicle');
            return {
                ...driver.toObject(),
                location: profile?.currentLocation,
                isOnline: profile?.isOnline,
                profile
            };
        }));
        res.json(driversWithProfiles);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch drivers" });
    }
});

// GET /api/admin/drivers/pending - List drivers waiting for approval
router.get("/drivers/pending", adminMiddleware, async (req, res) => {
    try {
        const pendingDrivers = await User.find({ role: "driver", status: "pending" }).select("-password");
        res.json(pendingDrivers);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch pending drivers" });
    }
});

// GET /api/admin/config - Get global app settings
router.get("/config", adminMiddleware, async (req, res) => {
    try {
        let config = await AppConfig.findOne({ key: "global" });
        if (!config) {
            config = new AppConfig({ key: "global" });
            await config.save();
        }
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch config" });
    }
});

// PUT /api/admin/config - Update global app settings
router.put("/config", adminMiddleware, async (req, res) => {
    try {
        const { fares, commission } = req.body;
        const config = await AppConfig.findOneAndUpdate(
            { key: "global" },
            { fares, commission, updatedAt: new Date() },
            { new: true, upsert: true }
        );
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: "Failed to update config" });
    }
});

// GET /api/admin/monitoring - Real-time trip monitoring
router.get("/monitoring", adminMiddleware, async (req, res) => {
    try {
        const activeRides = await Ride.find({
            status: { $in: ["driver_assigned", "arriving", "arrived", "ongoing"] }
        }).populate("customer driver", "name phone");

        const ridesWithLocations = await Promise.all(activeRides.map(async (ride) => {
            if (ride.driver) {
                const profile = await DriverProfile.findOne({ user: ride.driver._id });
                return {
                    ...ride.toObject(),
                    driver: {
                        ...ride.driver.toObject(),
                        location: profile?.currentLocation
                    }
                };
            }
            return ride;
        }));
        res.json(ridesWithLocations);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch active rides" });
    }
});

// existing approval/suspension routes...
router.get("/users", adminMiddleware, async (req, res) => {
    try {
        const { role } = req.query;
        const query = role ? { role } : {};
        const users = await User.find(query).select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

router.put("/driver/:id/approve", adminMiddleware, async (req, res) => {
    try {
        const driverUser = await User.findByIdAndUpdate(
            req.params.id,
            { status: "active" },
            { new: true }
        ).select("-password");

        if (!driverUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "Driver approved successfully", user: driverUser });
    } catch (error) {
        res.status(500).json({ error: "Failed to approve driver" });
    }
});

router.put("/user/:id/suspend", adminMiddleware, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: "suspended" },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "User suspended successfully", user: user });
    } catch (error) {
        res.status(500).json({ error: "Failed to suspend user" });
    }
});

export { router as adminRoutes };
