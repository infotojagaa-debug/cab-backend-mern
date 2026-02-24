import React, { createContext, useContext, useState, useEffect } from "react";
import { getApiUrl } from "../utils/api";

const AppContext = createContext(undefined);

/**
 * AUTH STORAGE STRATEGY
 * ---------------------
 * We use sessionStorage (NOT localStorage) for authToken and user data.
 *
 * WHY: localStorage is SHARED across all browser tabs of the same origin.
 * If an admin logs in on Tab A and a driver logs in on Tab B, Tab B's login
 * overwrites the shared localStorage token. When Tab A refreshes, it sees
 * the driver's token—and vice-versa.
 *
 * sessionStorage is PER-TAB. Each tab keeps its own session, so Admin/Driver/
 * Rider can be open simultaneously without interfering with each other.
 */

/**
 * Decode a JWT payload without verifying the signature.
 * We trust the payload contents for client-side routing only;
 * every API call still verifies the token server-side.
 */
const decodeJWT = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(base64));
  } catch {
    return null;
  }
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // ✅ sessionStorage — per-tab, not shared
    const token = sessionStorage.getItem("authToken");
    const storedUser = sessionStorage.getItem("user");

    // Priority 1: Decode the JWT for the authoritative role
    if (token) {
      const payload = decodeJWT(token);
      if (payload && payload.id && payload.role) {
        const base = storedUser ? JSON.parse(storedUser) : {};
        const merged = { ...base, id: payload.id, role: payload.role, email: payload.email };
        console.log("💾 AppContext: BOOT from JWT. Role:", merged.role);
        return merged;
      }
    }

    // Priority 2: Fall back to stored user (no JWT / malformed token)
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      console.log("💾 AppContext: BOOT from sessionStorage. Role:", parsed.role);
      return parsed;
    }

    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!sessionStorage.getItem("authToken")
  );
  const [currentRide, setCurrentRide] = useState(null);
  const [rideHistory, setRideHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const login = (userData, token) => {
    console.log("🔐 AppContext: Login. Role:", userData.role);
    setUser(userData);
    setIsAuthenticated(true);
    // ✅ sessionStorage — isolates this tab's session
    sessionStorage.setItem("user", JSON.stringify(userData));
    sessionStorage.setItem("authToken", token);
  };

  const logout = () => {
    console.log("🔐 AppContext: Logout");
    setUser(null);
    setIsAuthenticated(false);
    setCurrentRide(null);
    // ✅ sessionStorage — only clears this tab
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("authToken");
  };

  // Sync user profile from server on mount (keeps name/phone/avatar fresh).
  // The JWT role is our source of truth for routing; we don't let a failed API call log the user out.
  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem("authToken");
      console.log("🔐 AppContext: checkAuth. Token:", !!token);

      if (token) {
        try {
          const res = await fetch(getApiUrl("/api/auth/me"), {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const rawUser = await res.json();
            // Mongo returns _id; normalise to id
            const userData = {
              ...rawUser,
              id: rawUser.id || rawUser._id?.toString(),
            };
            console.log("🔐 AppContext: Auth sync OK. Role:", userData.role);
            setUser(userData);
            setIsAuthenticated(true);
            sessionStorage.setItem("user", JSON.stringify(userData));
          } else {
            console.warn("🔐 AppContext: Auth sync failed, status:", res.status, "— logging out");
            logout();
          }
        } catch (err) {
          // Network error: keep existing JWT-decoded state so app still works
          console.error("🔐 AppContext: Network error during auth sync:", err.message);
          setIsAuthenticated(true);
        }
      } else {
        console.log("🔐 AppContext: No token — unauthenticated");
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const isDriver = () => user?.role === "driver";
  const isAdmin = () => user?.role === "admin";

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        login,
        logout,
        currentRide,
        setCurrentRide,
        rideHistory,
        setRideHistory,
        loading,
        isDriver,
        isAdmin,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};
