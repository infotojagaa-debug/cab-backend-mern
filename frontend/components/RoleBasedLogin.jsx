import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Car, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { getApiUrl } from "@/utils/api";

export default function RoleBasedLogin() {
    const navigate = useNavigate();
    const { login, logout, isAuthenticated, user, loading: authLoading } = useApp();
    const [activeTab, setActiveTab] = useState("customer");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch(getApiUrl("/api/auth/login"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, role: activeTab }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Login failed");
            }

            login(data.user, data.token);

            // Redirect based on role
            if (data.user.role === "driver") navigate("/driver");
            else if (data.user.role === "admin") navigate("/admin");
            else navigate("/home");

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: "customer", label: "Rider", icon: User },
        { id: "driver", label: "Driver", icon: Car },
        { id: "admin", label: "Admin", icon: ShieldCheck },
    ];

    if (authLoading) return <div className="p-8 text-center text-gray-500">Loading auth state...</div>;

    if (isAuthenticated && user) {
        return (
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-fade-in-up border border-primary/10">
                <div className="text-center space-y-4">
                    <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-10 h-10 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-bold text-gray-900 text-nowrap">Welcome back, {user.name}!</h3>
                        <p className="text-gray-500 italic">You are logged in as {user.role}</p>
                    </div>
                    <Button
                        onClick={() => {
                            if (user.role === "driver") navigate("/driver");
                            else if (user.role === "admin") navigate("/admin");
                            else navigate("/home");
                        }}
                        className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg"
                    >
                        Go to Your Dashboard <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                    <button
                        onClick={() => {
                            // Logout handle
                            logout();
                        }}
                        className="text-sm text-gray-400 hover:text-destructive transition-colors font-medium"
                    >
                        Sign in with a different account
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full animate-fade-in-up">
            {/* Tab Headers */}
            <div className="flex border-b">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-semibold transition-colors
              ${activeTab === tab.id
                                ? "bg-primary text-white"
                                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Login Form */}
            <div className="p-8 space-y-6">
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-gray-900">
                        {activeTab === 'customer' && "Get moving with WeeFly"}
                        {activeTab === 'driver' && "Drive and Earn"}
                        {activeTab === 'admin' && "Admin Portal"}
                    </h3>
                    <p className="text-sm text-gray-500">
                        Sign in to your {activeTab} account
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email Address</label>
                        <Input
                            type="email"
                            name="email"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <Input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                            <span className="text-gray-600">Remember me</span>
                        </label>
                        <Link to="#" className="text-primary hover:underline font-medium">
                            Forgot password?
                        </Link>
                    </div>

                    <Button className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg" disabled={loading}>
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                Sign In <ArrowRight className="w-5 h-5 ml-2" />
                            </>
                        )}
                    </Button>
                </form>

                <div className="text-center text-sm text-gray-500">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-primary font-bold hover:underline">
                        Sign up as {activeTab}
                    </Link>
                </div>
            </div>
        </div>
    );
}
