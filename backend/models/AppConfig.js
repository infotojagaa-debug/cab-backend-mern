import mongoose from "mongoose";

const appConfigSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        default: "global"
    },
    fares: {
        baseFare: { type: Number, default: 40 },
        perKm: { type: Number, default: 15 },
        perMinute: { type: Number, default: 2 },
        surgeMultiplier: { type: Number, default: 1.0 },
    },
    commission: {
        percentage: { type: Number, default: 20 }, // 20% commission
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export const AppConfig = mongoose.model("AppConfig", appConfigSchema);
