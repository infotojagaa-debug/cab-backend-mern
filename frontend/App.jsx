import React from "react";
import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { RideProvider } from "./contexts/RideContext";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/Home"; // User Dashboard
import RideBooking from "./pages/RideBooking";
import OtpVerification from "./pages/OtpVerification";
import Payment from "./pages/Payment";
import Tracking from "./pages/Tracking";
import RideHistory from "./pages/RideHistory";
import NotFound from "./pages/NotFound";
import DriverDashboard from "./pages/driver/DriverDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

import { ProtectedRoute } from "./components/ProtectedRoutes";
import { useApp } from "./contexts/AppContext"; // Assuming useApp is imported from AppContext

const queryClient = new QueryClient();

const DebugOverlay = () => {
  const { user, isAuthenticated, loading, logout } = useApp();

  const handleHardReset = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // Only show in local dev
  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] bg-black/90 text-white p-4 rounded-2xl text-[10px] font-mono border border-white/20 backdrop-blur-md shadow-2xl pointer-events-auto min-w-[200px]">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between border-b border-white/10 pb-1 mb-1">
          <span className="font-bold text-primary">DEBUG PORTAL</span>
          <button onClick={handleHardReset} className="text-[8px] bg-red-500/20 hover:bg-red-500/40 text-red-500 px-2 py-0.5 rounded border border-red-500/30 transition-colors uppercase">Hard Reset Client</button>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-white/40">USER:</span>
          <span className="text-white truncate max-w-[120px]">{user?.email || 'null'}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-white/40">ROLE:</span>
          <span className="text-primary font-bold">{user?.role || 'null'}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-white/40">AUTH:</span>
          <span className={isAuthenticated ? "text-green-400" : "text-red-400"}>{String(isAuthenticated)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-white/40">LOADING:</span>
          <span className={loading ? "text-yellow-400" : "text-blue-400"}>{String(loading)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-white/40">PATH:</span>
          <span className="text-blue-200">{window.location.pathname}</span>
        </div>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/home" element={
          <ProtectedRoute allowedRoles={['customer', 'driver', 'admin']}>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/ride-booking" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <RideBooking />
          </ProtectedRoute>
        } />
        <Route path="/otp-verification" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <OtpVerification />
          </ProtectedRoute>
        } />
        <Route path="/payment" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Payment />
          </ProtectedRoute>
        } />
        <Route path="/tracking" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Tracking />
          </ProtectedRoute>
        } />
        <Route path="/ride-history" element={
          <ProtectedRoute allowedRoles={['customer', 'driver']}>
            <RideHistory />
          </ProtectedRoute>
        } />

        <Route path="/driver" element={
          <ProtectedRoute allowedRoles={['driver']}>
            <DriverDashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <RideProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </RideProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
