import express from "express";

const router = express.Router();

// Debug test endpoint
router.get("/test", (req, res) => {
    res.json({ status: "ok", message: "Geocoding proxy is active" });
});

// Proxy for Nominatim search
router.get("/search", async (req, res) => {
    const { q, limit = 5 } = req.query;
    if (!q) return res.status(400).json({ error: "Query parameter 'q' is required" });

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=${limit}`,
            {
                headers: {
                    "User-Agent": "RideHub/1.0 (support@ridehub.com)",
                },
            }
        );
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Geocoding proxy error:", error);
        res.status(500).json({ error: "Failed to fetch geocoding data" });
    }
});

// Proxy for Nominatim reverse geocoding
router.get("/reverse", async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: "Parameters 'lat' and 'lon' are required" });

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
            {
                headers: {
                    "User-Agent": "RideHub/1.0 (support@ridehub.com)",
                },
            }
        );
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Reverse geocoding proxy error:", error);
        res.status(500).json({ error: "Failed to fetch reverse geocoding data" });
    }
});

export default router;
