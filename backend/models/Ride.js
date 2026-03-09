import mongoose from "mongoose";

const rideSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    pickup: {
        address: { type: String, required: true },
        lat: Number,
        lng: Number,
    },
    dropoff: {
        address: { type: String, required: true },
        lat: Number,
        lng: Number,
    },
    status: {
        type: String,
        enum: [
            "searching",
            "driver_assigned",
            "arriving",
            "arrived",
            "ongoing",
            "completed",
            "cancelled",
        ],
        default: "searching",
    },
    fare: {
        type: Number,
        required: true,
    },
    distance: {
        type: String, // e.g. "5.2 km" - strictly for display or calculations
    },
    duration: {
        type: String, // e.g. "15 mins"
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending",
    },
    cabType: {
        type: String,
        enum: ["Mini", "Sedan", "SUV", "Bike", "Auto"],
        default: "Sedan",
    },
    scheduledTime: {
        type: Date,
    },
    isScheduled: {
        type: Boolean,
        default: false,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    feedback: {
        type: String,
    },
    otp: {
        type: String, // OTP to start the ride
    },
    notifications: [{
        type: {
            type: String,
            enum: ["booking_confirmed", "driver_assigned", "arriving", "arrived", "trip_started", "trip_completed", "sos_alert"],
        },
        message: String,
        timestamp: {
            type: Date,
            default: Date.now,
        },
    }],
    sosActivated: {
        type: Boolean,
        default: false,
    },
    sosTimestamp: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    completedAt: {
        type: Date,
    },
});

export const Ride = mongoose.model("Ride", rideSchema);
