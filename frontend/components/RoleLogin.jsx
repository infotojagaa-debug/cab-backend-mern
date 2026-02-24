import React from "react";
import { User, Car, ShieldCheck, ArrowRight } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Link, useNavigate } from "react-router-dom";

export default function RoleLogin() {
    const { isAuthenticated, user, logout } = useApp();
    const navigate = useNavigate();

    const roles = [
        {
            id: "customer",
            title: "Rider",
            description: "Book a ride in seconds",
            icon: User,
            accent: "from-amber-400 to-orange-500",
            iconBg: "bg-amber-500/20 border border-amber-400/40",
            iconColor: "text-amber-400",
            arrowHover: "group-hover:bg-amber-500 group-hover:border-amber-500",
            path: "/home"
        },
        {
            id: "driver",
            title: "Driver",
            description: "Earn on your schedule",
            icon: Car,
            accent: "from-sky-400 to-blue-600",
            iconBg: "bg-sky-500/20 border border-sky-400/40",
            iconColor: "text-sky-400",
            arrowHover: "group-hover:bg-sky-500 group-hover:border-sky-500",
            path: "/driver"
        },
        {
            id: "admin",
            title: "Admin",
            description: "Manage system & users",
            icon: ShieldCheck,
            accent: "from-emerald-400 to-teal-600",
            iconBg: "bg-emerald-500/20 border border-emerald-400/40",
            iconColor: "text-emerald-400",
            arrowHover: "group-hover:bg-emerald-500 group-hover:border-emerald-500",
            path: "/admin"
        }
    ];

    const handleRoleRedirect = (roleId) => {
        navigate(`/login?role=${roleId}`);
    };

    return (
        <div className="grid grid-cols-1 gap-3 w-full max-w-sm animate-in slide-in-from-right-12 duration-700">

            {/* Header */}
            <div className="relative overflow-hidden bg-black/60 backdrop-blur-xl rounded-2xl px-6 py-3 border border-amber-500/50 shadow-lg shadow-amber-500/10 mb-1">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent pointer-events-none" />
                <div className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <p className="text-center text-amber-300 font-black text-xs uppercase tracking-[0.35em]">
                        Select Your Portal
                    </p>
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                </div>
            </div>

            {/* Role Cards */}
            {roles.map((r, i) => (
                <button
                    key={r.id}
                    onClick={() => handleRoleRedirect(r.id)}
                    className="group relative overflow-hidden bg-black/50 hover:bg-black/70 backdrop-blur-xl transition-all duration-300 rounded-2xl px-5 py-4 text-left border border-white/10 hover:border-white/25 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:scale-[0.98]"
                    style={{ animationDelay: `${i * 100}ms` }}
                >
                    {/* Color sweep on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${r.accent} opacity-0 group-hover:opacity-[0.07] transition-opacity duration-300 rounded-2xl`} />

                    {/* Left accent bar */}
                    <div className={`absolute left-0 top-4 bottom-4 w-0.5 bg-gradient-to-b ${r.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full`} />

                    <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className={`w-14 h-14 rounded-xl ${r.iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                            <r.icon className={`w-7 h-7 ${r.iconColor}`} />
                        </div>

                        {/* Text */}
                        <div className="flex-1">
                            <h3 className="text-base font-black text-white leading-none mb-0.5 tracking-wide">{r.title}</h3>
                            <p className="text-white/50 font-medium text-xs group-hover:text-white/70 transition-colors">{r.description}</p>
                        </div>

                        {/* Arrow */}
                        <div className={`w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/60 group-hover:text-white transition-all duration-300 ${r.arrowHover} group-hover:border-transparent`}>
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </button>
            ))}

            {/* Footer */}
            <div className="text-center mt-1">
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.2em]">
                    {isAuthenticated ? (
                        <button onClick={logout} className="text-amber-400 hover:underline">Logout from {user?.name}</button>
                    ) : (
                        <>New to WeeFly? <Link to="/register" className="text-amber-400 hover:underline ml-1">Join as partner</Link></>
                    )}
                </p>
            </div>
        </div>
    );
}
