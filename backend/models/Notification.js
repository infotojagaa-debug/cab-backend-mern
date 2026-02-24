import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    ride: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ride",
    },
    type: {
        type: String,
        enum: [
            "booking_confirmed",
            "driver_assigned",
            "driver_arrived",
            "trip_started",
            "trip_completed",
            "sos_alert",
        ],
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    read: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const Notification = mongoose.model("Notification", notificationSchema);
