import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    ride: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ride",
    },
    subject: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["open", "investigating", "resolved", "closed"],
        default: "open",
    },
    resolution: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const Complaint = mongoose.model("Complaint", complaintSchema);
