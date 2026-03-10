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

    console.log(`🔍 Nominatim Search: "${q}"`);

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=${limit}&addressdetails=1`,
            {
                headers: {
                    "User-Agent": "WeeFly-Cab-App/1.1 (support@weefly.com)",
                    "Referer": "https://cab-backend-mern.onrender.com",
                    "Accept-Language": "en-US,en;q=0.9",
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Nominatim API Error (${response.status}):`, errorText);
            throw new Error(`Nominatim error: ${response.status}`);
        }

        const data = await response.json();
        // Ensure data is always an array
        const results = Array.isArray(data) ? data : [];
        console.log(`✅ Nominatim Result: Found ${results.length} items`);
        res.json(results);
    } catch (error) {
        console.error("❌ Geocoding proxy error:", error);
        res.status(500).json({ error: "Failed to fetch geocoding data", details: error.message });
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
                    "User-Agent": "WeeFly-Cab-App/1.1 (support@weefly.com)",
                    "Referer": "https://cab-backend-mern.onrender.com",
                    "Accept-Language": "en-US,en;q=0.9",
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Nominatim Reverse Error (${response.status}):`, errorText);
            throw new Error(`Nominatim error: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("❌ Reverse geocoding proxy error:", error);
        res.status(500).json({ error: "Failed to fetch reverse geocoding data", details: error.message });
    }
});

export default router;
