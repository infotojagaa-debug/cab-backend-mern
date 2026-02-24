import React from "react";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, ArrowRight, AlertCircle, User as UserIcon, Car, ShieldCheck, CheckCircle } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { getApiUrl } from "@/utils/api";

export default function Login() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const initialRole = queryParams.get("role") || "customer";
  const isRoleLocked = queryParams.has("role");

  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(initialRole);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(getApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      let data = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON login response:", text);
        setError(`Server Error: ${response.status}`);
        return;
      }

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Use the login method from AppContext
      login(data.user, data.token);

      // Redirect based on role
      if (data.user.role === "driver") {
        navigate("/driver");
      } else if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    React.createElement('div', {
      className: "min-h-screen flex flex-col relative overflow-hidden font-sans selection:bg-primary selection:text-white",
      style: {
        backgroundImage: `url('https://img.freepik.com/premium-photo/indian-kolkata-traditional-yellow-taxi-city_485374-6290.jpg?w=2000')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    }
      /* Dark Overlay for better contrast */
      , React.createElement('div', { className: "absolute inset-0 bg-black/60 backdrop-blur-[2px] z-0" })

      /* Redesigned Navbar */
      , React.createElement('nav', { className: "shrink-0 border-b border-white/5 bg-black/20 backdrop-blur-xl z-[1000] sticky top-0" }
        , React.createElement('div', { className: "max-w-7xl mx-auto px-6 py-4 flex items-center justify-between" }
          , React.createElement(Link, { to: "/", className: "flex items-center gap-3 group" }
            , React.createElement('div', { className: "bg-primary p-2 rounded-xl shadow-[0_0_20px_rgba(255,153,0,0.3)] group-hover:scale-105 transition-transform duration-500" }
              , React.createElement(MapPin, { className: "w-5 h-5 text-white" })
            )
            , React.createElement('span', { className: "font-bold text-xl text-white tracking-tight" }, "WeeFly Cabs")
          )
          , React.createElement('div', { className: "flex items-center gap-4" }
            , React.createElement('span', { className: "hidden sm:inline text-sm font-medium text-white/60" }, "New here?")
            , React.createElement(Link, { to: "/register" }
              , React.createElement(Button, { variant: "outline", className: "border-white/40 bg-white/5 text-white hover:bg-white/20 hover:border-white/60 font-bold text-xs uppercase tracking-wider px-6 py-5 rounded-xl transition-all duration-300" }
                , "Join Now"
              )
            )
          )
        )
      )

      /* Centered Login Card Container */
      , React.createElement('main', { className: "relative z-10 flex-1 flex items-center justify-center p-6" }
        , React.createElement('div', { className: "w-full max-w-md animate-in fade-in zoom-in-95 duration-1000 slide-in-from-bottom-4" }
          , React.createElement('div', { className: "rounded-[2.5rem] border border-white/10 bg-black/40 backdrop-blur-2xl p-8 md:p-10 space-y-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]" }
            , React.createElement('div', { className: "space-y-2 text-center" }
              , React.createElement('h1', { className: "text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight" }
                , role === 'customer' ? 'Rider Login' :
                  role === 'driver' ? 'Driver Login' :
                    role === 'admin' ? 'Admin Login' : 'Welcome Back'
              )
              , React.createElement('p', { className: "text-white/60 text-xs font-semibold uppercase tracking-[0.15em]" }
                , isRoleLocked ? `Authorized ${role} access only` : "Sign in to continue your journey"
              )
            )

            // Role Selection
            , !isRoleLocked && (
              React.createElement('div', { className: "flex p-1.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10" }
                , [
                  { id: "customer", label: "Rider", icon: UserIcon },
                  { id: "driver", label: "Driver", icon: Car },
                  { id: "admin", label: "Admin", icon: ShieldCheck },
                ].map((t) =>
                  React.createElement('button', {
                    key: t.id,
                    type: "button",
                    onClick: () => setRole(t.id),
                    className: `flex-1 py-3 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all duration-500
                      ${role === t.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-white/40 hover:text-white/80 hover:bg-white/5"}
                    `
                  }
                    , React.createElement(t.icon, { className: "w-3.5 h-3.5" })
                    , t.label
                  )
                )
              )
            )

            , error && (
              React.createElement('div', { className: "rounded-2xl bg-red-500/10 border border-red-500/20 p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2" }
                , React.createElement(AlertCircle, { className: "w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" })
                , React.createElement('p', { className: "text-xs font-semibold text-red-500" }, error)
              )
            )

            , React.createElement('form', { onSubmit: handleLogin, className: "space-y-5" }
              , React.createElement('div', { className: "space-y-2" }
                , React.createElement('label', { className: "text-[10px] font-bold text-white/50 uppercase tracking-widest block ml-1" }, "Email Address")
                , React.createElement(Input, {
                  type: "email",
                  placeholder: "Enter your email",
                  value: email,
                  onChange: (e) => setEmail(e.target.value),
                  disabled: loading,
                  className: "h-14 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-2xl focus:ring-primary/40 focus:border-primary transition-all duration-300 font-medium px-5"
                })
              )
              , React.createElement('div', { className: "space-y-2" }
                , React.createElement('label', { className: "text-[10px] font-bold text-white/50 uppercase tracking-widest block ml-1" }, "Security Key")
                , React.createElement(Input, {
                  type: "password",
                  placeholder: "••••••••",
                  value: password,
                  onChange: (e) => setPassword(e.target.value),
                  disabled: loading,
                  className: "h-14 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-2xl focus:ring-primary/40 focus:border-primary transition-all duration-300 font-medium px-5"
                })
              )
              , React.createElement('div', { className: "flex items-center justify-between px-1" }
                , React.createElement('label', { className: "flex items-center gap-2.5 cursor-pointer group" }
                  , React.createElement('div', { className: "relative" }
                    , React.createElement('input', { type: "checkbox", className: "peer sr-only" })
                    , React.createElement('div', { className: "w-5 h-5 border-2 border-white/20 rounded-md peer-checked:bg-primary peer-checked:border-primary transition-all duration-300" })
                    , React.createElement(CheckCircle, { className: "absolute inset-0 w-5 h-5 text-white scale-0 peer-checked:scale-75 transition-transform duration-300" })
                  )
                  , React.createElement('span', { className: "text-[11px] font-medium text-white/50 group-hover:text-white/70 transition-colors" }, "Keep me logged in")
                )
                , React.createElement('a', { href: "#", className: "text-[11px] font-bold text-primary hover:text-orange-400 transition-colors" }, "Forgot Password?")
              )
              , React.createElement(Button, {
                type: "submit",
                disabled: loading,
                className: "w-full py-8 rounded-full bg-primary hover:bg-orange-600 text-white font-bold text-lg uppercase tracking-wider shadow-xl shadow-primary/20 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] mt-4"
              }
                , loading ? "Authenticating..." : "Login to Portal"
                , !loading && React.createElement(ArrowRight, { className: "w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" })
              )
            )

            , React.createElement('div', { className: "relative py-2" }
              , React.createElement('div', { className: "absolute inset-0 flex items-center" }
                , React.createElement('div', { className: "w-full border-t border-white/10" })
              )
              , React.createElement('div', { className: "relative flex justify-center text-[10px] font-bold uppercase tracking-[0.2em]" }
                , React.createElement('span', { className: "px-4 bg-transparent text-white/30" }, "OR")
              )
            )

            , React.createElement(Button, { variant: "outline", className: "w-full h-14 rounded-full border-white/30 bg-white/5 text-white hover:bg-white/10 hover:border-white/50 font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-lg" }
              , React.createElement('img', { src: "https://www.google.com/favicon.ico", className: "w-4 h-4 mr-3 grayscale brightness-200" }),
              "Continue with Google"
            )

            , React.createElement('p', { className: "text-center text-[10px] font-medium text-white/40 leading-relaxed max-w-[280px] mx-auto" }
              , "By logging in, you agree to our "
              , React.createElement('a', { href: "#", className: "text-primary/80 hover:text-primary transition-colors hover:underline" }, "Terms")
              , " and "
              , React.createElement('a', { href: "#", className: "text-primary/80 hover:text-primary transition-colors hover:underline" }, "Privacy Policy")
            )
          )

          /* Demo Info */
          , React.createElement('div', { className: "mt-8 p-6 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 text-center animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-300" }
            , React.createElement('p', { className: "text-[11px] text-white/40 mb-3 font-bold uppercase tracking-widest" }, "Quick Access Credentials")
            , React.createElement('div', { className: "flex flex-col sm:flex-row items-center justify-center gap-3" }
              , React.createElement('div', { className: "flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/20 border border-white/5" }
                , React.createElement('span', { className: "text-[10px] text-white/30 font-bold uppercase" }, "Email:")
                , React.createElement('code', { className: "text-[11px] text-primary/90 font-mono" }, "demo@weefly.com")
              )
              , React.createElement('div', { className: "flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/20 border border-white/5" }
                , React.createElement('span', { className: "text-[10px] text-white/30 font-bold uppercase" }, "Pass:")
                , React.createElement('code', { className: "text-[11px] text-primary/90 font-mono" }, "password123")
              )
            )
          )
        )
      )
    )
  );
}
