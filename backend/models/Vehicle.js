import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Can be the driver or an admin/fleet owner
    },
    make: {
        type: String,
        required: true,
    },
    model: {
        type: String,
        required: true,
    },
    year: {
        type: Number,
    },
    color: {
        type: String,
    },
    plateNumber: {
        type: String,
        required: true,
        unique: true,
    },
    type: {
        type: String,
        enum: ["sedan", "suv", "hatchback", "luxury", "auto"],
        default: "sedan",
    },
    status: {
        type: String,
        enum: ["active", "maintenance", "inactive"],
        default: "active",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const Vehicle = mongoose.model("Vehicle", vehicleSchema);
