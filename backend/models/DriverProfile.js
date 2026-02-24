import mongoose from "mongoose";

const driverProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true,
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
    },
    isOnline: {
        type: Boolean,
        default: false,
    },
    currentLocation: {
        lat: Number,
        lng: Number,
        lastUpdated: Date,
    },
    rating: {
        type: Number,
        default: 5.0,
    },
    totalTrips: {
        type: Number,
        default: 0,
    },
    walletBalance: {
        type: Number,
        default: 0,
    },
    totalEarnings: {
        type: Number,
        default: 0,
    },
    earnings: {
        today: { type: Number, default: 0 },
        week: { type: Number, default: 0 },
        month: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
    },
    documents: {
        licenseImage: String,
        idProof: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const DriverProfile = mongoose.model("DriverProfile", driverProfileSchema);
