import React, { useState } from "react";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function RatingModal({ isOpen, onClose, ride, onSubmit }) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            alert("Please select a rating");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(rating, feedback);
            onClose();
        } catch (error) {
            console.error("Error submitting rating:", error);
            alert("Failed to submit rating");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = () => {
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Rate Your Ride</DialogTitle>
                    <DialogDescription>
                        How was your experience with this ride?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Driver Info */}
                    {ride?.driver && (
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xl">👤</span>
                            </div>
                            <div>
                                <p className="font-semibold text-foreground">{ride.driver.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {ride.cabType || "Sedan"} • {ride.distance}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Star Rating */}
                    <div className="flex flex-col items-center gap-3">
                        <p className="text-sm font-medium text-foreground">Rate your driver</p>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-10 h-10 ${star <= (hoveredRating || rating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-300"
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="text-sm text-muted-foreground">
                                {rating === 1 && "Poor"}
                                {rating === 2 && "Fair"}
                                {rating === 3 && "Good"}
                                {rating === 4 && "Very Good"}
                                {rating === 5 && "Excellent"}
                            </p>
                        )}
                    </div>

                    {/* Feedback */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Additional Feedback (Optional)
                        </label>
                        <Textarea
                            placeholder="Share your experience..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handleSkip}
                            className="flex-1"
                            disabled={isSubmitting}
                        >
                            Skip
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="flex-1 bg-gradient-to-r from-primary to-accent"
                            disabled={isSubmitting || rating === 0}
                        >
                            {isSubmitting ? "Submitting..." : "Submit Rating"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
