import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
        req.user = decoded;
        next();
    } catch (error) {
        console.error("❌ Auth Middleware: Token verification failed:", error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Token expired. Please login again.", code: "TOKEN_EXPIRED" });
        }
        res.status(400).json({ error: "Invalid token.", code: "INVALID_TOKEN", details: error.message });
    }
};
