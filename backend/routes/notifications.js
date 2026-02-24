import { Router } from "express";
import { Notification } from "../models/Notification.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

// GET /api/notifications - Get user's notifications
router.get("/", verifyToken, async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id })
            .populate("ride", "pickup dropoff fare status")
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put("/:id/read", verifyToken, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }

        if (notification.user.toString() !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        notification.read = true;
        await notification.save();

        res.json(notification);
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ error: "Failed to update notification" });
    }
});

// DELETE /api/notifications/:id - Delete notification
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }

        if (notification.user.toString() !== req.user.id) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        await notification.deleteOne();

        res.json({ message: "Notification deleted" });
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ error: "Failed to delete notification" });
    }
});

// Helper function to create notification
export async function createNotification(userId, rideId, type, message) {
    try {
        const notification = new Notification({
            user: userId,
            ride: rideId,
            type,
            message,
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        return null;
    }
}

export { router as notificationRoutes };
