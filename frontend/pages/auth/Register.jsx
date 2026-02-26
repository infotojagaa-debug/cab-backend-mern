import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, AlertCircle, CheckCircle, Car, User } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { getApiUrl } from "@/utils/api";

export default function Register() {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useApp();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "customer" // Default role
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const setRole = (role) => {
    setFormData({ ...formData, role });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Please enter your name");
      return false;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email");
      return false;
    }

    if (formData.phone.length < 10) {
      setError("Please enter a valid phone number");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(getApiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role
        }),
      });

      let data = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error(`Server Error: ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || "Registration failed");
      }

      setSuccess("Account created successfully! Redirecting...");

      // Short delay to show success message
      setTimeout(() => {
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("isAuthenticated", "true");

        // Redirect based on role
        if (data.user.role === "driver") navigate("/driver");
        else if (data.user.role === "admin") navigate("/admin");
        else navigate("/home");
      }, 1500);

    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col bg-gray-950 overflow-x-hidden">
      {/* Background Image with Overlay */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center transition-transform duration-1000 scale-105"
        style={{
          backgroundImage: "url('https://png.pngtree.com/thumb_back/fw800/background/20241217/pngtree-a-bright-yellow-taxi-cab-navigating-wet-street-on-rainy-night-image_16815903.jpg')",
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-gray-950/90 via-gray-900/60 to-gray-950/90 backdrop-blur-[2px]" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group hover:opacity-90 transition">
            <Logo />
            <div className="flex flex-col">
              <span className="font-black text-xl text-white tracking-tight leading-none">Wee<span className="text-amber-500">Fly</span></span>
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] mt-0.5">Registration</span>
            </div>
          </Link>
          <p className="text-sm text-gray-400 font-medium">Already have an account?{" "}
            <Link to="/login" className="text-amber-500 font-black hover:text-amber-400 transition-colors uppercase tracking-widest text-xs">Login</Link>
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          <div className="rounded-[2.5rem] border border-white/10 bg-gray-950/40 backdrop-blur-2xl p-10 space-y-8 shadow-2xl animate-fade-in-up">
            <div className="space-y-3 text-center">
              <div className="inline-flex items-center gap-2 text-amber-500 font-black text-[10px] uppercase tracking-[0.4em] mb-2">
                <span className="w-8 h-px bg-amber-500/30"></span>
                WeeFly Cabs
                <span className="w-8 h-px bg-amber-500/30"></span>
              </div>
              <h1 className="text-4xl font-black text-white leading-tight">Create <span className="text-amber-500 italic">Account</span></h1>
              <p className="text-gray-400 font-medium text-sm italic">Start your premium journey with WeeFly today</p>
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-white/5 border border-white/5 rounded-2xl">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest transition-all ${formData.role === 'customer' ? 'bg-amber-500 text-gray-950 shadow-lg shadow-amber-500/30' : 'text-gray-400 hover:bg-white/5'}`}
              >
                <User className="w-4 h-4 shrink-0" /> Rider
              </button>
              <button
                type="button"
                onClick={() => setRole('driver')}
                className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest transition-all ${formData.role === 'driver' ? 'bg-amber-500 text-gray-950 shadow-lg shadow-amber-500/30' : 'text-gray-400 hover:bg-white/5'}`}
              >
                <Car className="w-4 h-4 shrink-0" /> Driver
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest transition-all ${formData.role === 'admin' ? 'bg-amber-500 text-gray-950 shadow-lg shadow-amber-500/30' : 'text-gray-400 hover:bg-white/5'}`}
              >
                <CheckCircle className="w-4 h-4 shrink-0" /> Admin
              </button>
            </div>

            {error && (
              <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 flex items-start gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-100 font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-emerald-100 font-medium">{success}</p>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                  <Input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                    className="h-14 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-gray-700 focus:border-amber-500/50 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    className="h-14 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-gray-700 focus:border-amber-500/50 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
                <Input
                  type="tel"
                  name="phone"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                  className="h-14 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-gray-700 focus:border-amber-500/50 transition-colors"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Password</label>
                  <Input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    className="h-14 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-gray-700 focus:border-amber-500/50 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Confirm Password</label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    className="h-14 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-gray-700 focus:border-amber-500/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 ml-1">
                <input
                  type="checkbox"
                  id="terms"
                  className="w-4 h-4 rounded-lg bg-white/5 border-white/10 checked:bg-amber-500 transition-all cursor-pointer"
                />
                <label htmlFor="terms" className="text-xs text-gray-500 font-medium">
                  I agree to the <a href="#" className="text-amber-500 hover:text-amber-400">Terms of Service</a>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-16 bg-amber-500 hover:bg-amber-400 text-gray-950 font-black rounded-2xl text-sm uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-amber-500/20 flex items-center justify-center gap-3"
              >
                {loading ? "Initializing..." : "Create Account"}
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.4em]">
                <span className="px-4 bg-gray-950/20 text-gray-600 backdrop-blur-sm">OR</span>
              </div>
            </div>

            <button className="w-full h-14 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 1.56-1.56 2.73-3.21 2.73-2.02 0-3.65-1.63-3.65-3.65s1.63-3.65 3.65-3.65c.88 0 1.68.32 2.3.84l2.13-2.13C18.25 6.44 16.5 5.5 14.51 5.5c-4.14 0-7.5 3.36-7.5 7.5s3.36 7.5 7.5 7.5c4.14 0 7.5-3.36 7.5-7.5 0-.47-.05-.92-.16-1.36z" />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

const Logo = () => (
  <div className="relative flex-shrink-0">
    <svg width="40" height="40" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
      <circle cx="26" cy="26" r="25" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
      <rect x="14" y="22" width="24" height="13" rx="3" fill="#1f2937" />
      <path d="M18 22 L21 16 L31 16 L34 22 Z" fill="#1f2937" />
      <path d="M20 22 L22.5 17.5 L29.5 17.5 L32 22 Z" fill="#60a5fa" opacity="0.9" />
    </svg>
  </div>
);
