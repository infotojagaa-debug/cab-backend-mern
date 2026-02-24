export const checkRole = (roles) => {
    return (req, res, next) => {
        console.log(`🛡️ Role Check: User Role [${req.user?.role}] vs Allowed [${roles}]`);
        if (!req.user || !roles.includes(req.user.role)) {
            console.error("❌ Access Denied: Role mismatch");
            return res.status(403).json({ error: "Access denied. Insufficient permissions." });
        }
        next();
    };
};
