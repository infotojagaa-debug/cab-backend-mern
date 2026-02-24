import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useApp } from "../contexts/AppContext";

// Maps each role to its home page
const ROLE_HOME = {
    admin: "/admin",
    driver: "/driver",
    customer: "/home",
};

export const ProtectedRoute = ({ allowedRoles, children }) => {
    const { isAuthenticated, user, loading } = useApp();

    // While auth state is being rehydrated after refresh, show a loading screen.
    // This prevents any premature redirects before the user object is fully loaded.
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-950">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-white/50 text-sm font-semibold uppercase tracking-widest">Authenticating...</p>
                </div>
            </div>
        );
    }

    // Not logged in at all → send to login
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // Role does not have access to this route → send to their own home page
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        const redirectTo = ROLE_HOME[user.role] || "/login";
        console.warn(`🛡️ ProtectedRoute: Role [${user.role}] not in [${allowedRoles}]. Redirecting to ${redirectTo}`);
        return <Navigate to={redirectTo} replace />;
    }

    return children ? children : <Outlet />;
};
