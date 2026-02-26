import React, { useState, useEffect } from "react";
import {
    Activity, Users, Car, Map as MapIcon,
    Settings, LogOut, ShipWheel, TrendingUp,
    IndianRupee, CheckCircle, ShieldCheck,
    XCircle, Eye, Clock, BarChart3, Globe,
    Search, Filter, Navigation
} from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { useRide } from "../../contexts/RideContext";
import { Button } from "@/components/ui/button";
import AdminMap from "../../components/map/AdminMap";
import { getApiUrl } from "@/utils/api";

export default function AdminDashboard() {
    const { user, logout } = useApp();
    const { socket } = useRide();
    const [activeTab, setActiveTab] = useState("overview");
    const [stats, setStats] = useState({ totalUsers: 0, activeDrivers: 0, totalRevenue: 0, totalRides: 0 });
    const [pendingDrivers, setPendingDrivers] = useState([]);
    const [allDrivers, setAllDrivers] = useState([]);
    const [activeRides, setActiveRides] = useState([]);
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [focusLocation, setFocusLocation] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000); // Periodic refresh
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!socket) return;

        // Join global monitoring room
        socket.emit("joinAdmin");

        socket.on("globalDriverLocation", (data) => {
            // Update the general drivers list
            setAllDrivers(prev => prev.map(d =>
                d._id === data.driverId ? { ...d, location: data.location } : d
            ));
            // Update any active rides that feature this driver
            setActiveRides(prev => prev.map(r =>
                r.driver?._id === data.driverId ? { ...r, driver: { ...r.driver, location: data.location } } : r
            ));
        });

        socket.on("rideCancelled", (data) => {
            setActiveRides(prev => prev.filter(r => r._id !== data.rideId));
            if (focusLocation?.lat === data.location?.lat) setFocusLocation(null);
            fetchDashboardData();
        });

        socket.on("rideAccepted", () => fetchDashboardData());
        socket.on("tripCompleted", () => fetchDashboardData());

        return () => {
            socket.off("joinAdmin");
            socket.off("globalDriverLocation");
            socket.off("driverLocationUpdate");
            socket.off("rideCancelled");
            socket.off("rideAccepted");
            socket.off("tripCompleted");
        };
    }, [socket]);

    const fetchDashboardData = async () => {
        try {
            const token = sessionStorage.getItem("authToken");
            const headers = { Authorization: `Bearer ${token}` };

            const [statsRes, pendingRes, driversRes, ridesRes, configRes] = await Promise.all([
                fetch(getApiUrl("/api/admin/stats"), { headers }),
                fetch(getApiUrl("/api/admin/drivers/pending"), { headers }),
                fetch(getApiUrl("/api/admin/drivers"), { headers }),
                fetch(getApiUrl("/api/admin/monitoring"), { headers }),
                fetch(getApiUrl("/api/admin/config"), { headers })
            ]);

            if (statsRes.ok) setStats(await statsRes.json());
            if (pendingRes.ok) setPendingDrivers(await pendingRes.json());
            if (driversRes.ok) setAllDrivers(await driversRes.json());
            if (ridesRes.ok) setActiveRides(await ridesRes.json());
            if (configRes.ok) setConfig(await configRes.json());

            setLoading(false);
        } catch (error) {
            console.error("Dashboard fetch error:", error);
        }
    };

    const handleApproveDriver = async (driverId) => {
        try {
            const token = sessionStorage.getItem("authToken");
            const res = await fetch(getApiUrl(`/api/admin/driver/${driverId}/approve`), {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) fetchDashboardData();
        } catch (error) {
            console.error("Approval error:", error);
        }
    };

    const handleSuspendUser = async (userId) => {
        try {
            const token = sessionStorage.getItem("authToken");
            const res = await fetch(getApiUrl(`/api/admin/user/${userId}/suspend`), {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) fetchDashboardData();
        } catch (error) {
            console.error("Suspension error:", error);
        }
    };

    const updateConfig = async () => {
        try {
            const token = sessionStorage.getItem("authToken");
            const res = await fetch(getApiUrl("/api/admin/config"), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(config)
            });
            if (res.ok) alert("Config updated successfully");
        } catch (error) {
            console.error("Update error:", error);
        }
    };

    const handleCancelMission = async (rideId) => {
        if (!window.confirm("CRITICAL ACTION: Are you sure you want to ABORT this mission?")) return;
        try {
            const token = sessionStorage.getItem("authToken");
            const res = await fetch(getApiUrl(`/api/rides/${rideId}/status`), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: "cancelled" })
            });
            if (res.ok) {
                setFocusLocation(null);
                fetchDashboardData();
            }
        } catch (err) {
            console.error("Cancellation error:", err);
        }
    };

    const trackRideOnMap = (ride) => {
        setFocusLocation(ride.driver?.location || ride.pickup);
        setActiveTab("grid");
    };

    return (
        <div className="h-screen w-screen relative flex font-sans selection:bg-amber-500 selection:text-white bg-gray-950 overflow-hidden" style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&q=80&w=2000')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        }}>
            {/* Dark Overlay */}
            <div className={`absolute inset-0 bg-black/75 backdrop-blur-[1px] z-0`} />

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:sticky top-0 left-0 z-50 w-80 bg-gray-900/95 lg:bg-white/5 backdrop-blur-3xl border-r border-white/10 p-8 flex flex-col h-screen shadow-2xl transition-transform duration-300 lg:translate-x-0 overflow-y-auto custom-scrollbar ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="lg:hidden absolute top-8 right-8 text-white/40 hover:text-white"
                >
                    <XCircle className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-4 mb-12">
                    <div className="bg-amber-500 p-3 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                        <Car className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white leading-none tracking-tighter uppercase italic">WeeFly</h1>
                        <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.4em] mt-1.5 opacity-80">HQ Central Command</p>
                    </div>
                </div>

                <nav className="space-y-2 flex-grow">
                    {[
                        { id: "overview", label: "Dashboard", icon: <Activity className="w-5 h-5" /> },
                        { id: "grid", label: "Live Grid", icon: <Globe className="w-5 h-5" /> },
                        { id: "drivers", label: "WeeFly Hub", icon: <ShipWheel className="w-5 h-5" /> },
                        { id: "operations", label: "Mission Control", icon: <TrendingUp className="w-5 h-5" /> },
                        { id: "analytics", label: "Insights", icon: <BarChart3 className="w-5 h-5" /> },
                        { id: "settings", label: "System Core", icon: <Settings className="w-5 h-5" /> },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                if (item.id !== 'grid') setFocusLocation(null);
                                setIsSidebarOpen(false); // Close on selection on mobile
                            }}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-300 relative overflow-hidden group ${activeTab === item.id
                                ? "bg-amber-500 text-white shadow-[0_10px_30px_rgba(245,158,11,0.3)] translate-x-2"
                                : "text-white/40 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <span className="relative z-10">{item.icon}</span>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-black relative z-10">{item.label}</span>
                            {activeTab === item.id && (
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 opacity-100 transition-opacity" />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="mt-10 pt-10 border-t border-white/10">
                    <div className="bg-white/5 p-4 rounded-[2.5rem] mb-6 flex items-center gap-4 border border-white/5 backdrop-blur-md">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-white shadow-lg text-lg">
                            {user?.name?.[0]}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-black text-white truncate uppercase tracking-tighter">{user?.name}</p>
                            <p className="text-[9px] font-bold text-amber-500/60 uppercase tracking-widest">Administrator</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em] text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all border border-red-500/20 active:scale-95"
                    >
                        <LogOut className="w-4 h-4" /> Terminate Session
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="relative z-10 flex-grow p-6 sm:p-12 flex flex-col h-screen overflow-hidden">
                <header className="mb-8 sm:mb-12 shrink-0">
                    <div className="flex items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden p-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"
                            >
                                <Activity className="w-5 h-5" />
                            </button>
                            <div>
                                <h2 className="text-3xl sm:text-7xl font-black text-white mb-2 capitalize tracking-tighter drop-shadow-2xl">{activeTab}</h2>
                                <p className="text-white/40 font-bold uppercase text-[8px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.5em] ml-1">Neural Grid Control & Deployment Manager</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={fetchDashboardData} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-white active:rotate-180 duration-500">
                                <Activity className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="flex-grow overflow-y-auto pr-0 sm:pr-4 custom-scrollbar pb-40">
                    {activeTab === "overview" && (
                        <div className="space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            {/* Stats Strip */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: "Net Revenue", value: `₹${stats.totalRevenue?.toLocaleString() || '0'}`, icon: <IndianRupee className="w-6 h-6" />, desc: "+12.5% this week", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
                                    { label: "WeeFly Status", value: stats.activeDrivers, icon: <Car className="w-6 h-6" />, desc: "Online Assets", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
                                    { label: "Rider Base", value: stats.totalUsers, icon: <Users className="w-6 h-6" />, desc: "Registered Users", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
                                    { label: "Mission Count", value: stats.totalRides, icon: <CheckCircle className="w-6 h-6" />, desc: "Success Rate: 99%", color: "text-indigo-400", bg: "bg-indigo-400/10", border: "border-indigo-400/20" },
                                ].map((s, i) => (
                                    <div key={i} className={`bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border ${s.border} shadow-2xl hover:bg-white/10 transition-all duration-500 group cursor-default h-full flex flex-col justify-between`}>
                                        <div className="flex items-center justify-between mb-6">
                                            <div className={`${s.bg} ${s.color} w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                                                {s.icon}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">{s.desc}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">{s.label}</p>
                                            <p className="text-2xl sm:text-3xl xl:text-4xl font-black text-white tracking-tighter whitespace-nowrap truncate drop-shadow-lg">{s.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Verification Center */}
                            <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-10 shadow-inner">
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="text-xl font-black text-white flex items-center gap-4">
                                        <ShieldCheck className="w-6 h-6 text-amber-500" /> Security Verification Queue
                                    </h3>
                                    <span className="px-5 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-black text-amber-500 uppercase tracking-widest">
                                        {pendingDrivers.filter(d => d.status === 'pending').length} Action Items
                                    </span>
                                </div>
                                {pendingDrivers.filter(d => d.status === 'pending').length === 0 ? (
                                    <div className="py-20 text-center border border-dashed border-white/10 rounded-[40px] bg-white/[0.02]">
                                        <Activity className="w-12 h-12 text-white/5 mx-auto mb-6 animate-pulse" />
                                        <p className="text-white/20 font-black uppercase text-[10px] tracking-[0.5em]">Network Integrity Nominal • Queue Clear</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {pendingDrivers.filter(d => d.status === 'pending').map(driver => (
                                            <div key={driver._id} className="p-6 bg-white/5 rounded-[2rem] flex items-center justify-between border border-white/5 hover:border-amber-500/30 transition-all group backdrop-blur-md">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-center justify-center font-black text-amber-500 text-2xl shadow-inner group-hover:bg-amber-500 group-hover:text-white transition-all">
                                                        {driver.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-black text-white tracking-tight">{driver.name}</p>
                                                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.15em] mt-0.5">{driver.email}</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={() => handleApproveDriver(driver._id)}
                                                    className="bg-amber-500 hover:bg-amber-600 text-white font-black h-12 px-8 rounded-full shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
                                                >
                                                    Validate
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "grid" && (
                        <div className="w-full h-[calc(100vh-280px)] min-h-[600px] animate-in fade-in zoom-in-95 duration-700">
                            <AdminMap focusLocation={focusLocation} allDrivers={allDrivers} activeRides={activeRides} />
                        </div>
                    )}

                    {activeTab === "drivers" && (
                        <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="p-8 border-b border-white/10 bg-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-6 px-4 bg-black/20 rounded-2xl border border-white/5 w-96">
                                    <Search className="text-white/20 w-4 h-4" />
                                    <input placeholder="Search WeeFly assets..." className="bg-transparent border-none outline-none text-white font-medium text-xs py-4 w-full placeholder:text-white/20" />
                                </div>
                                <div className="flex gap-3">
                                    <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase text-white hover:bg-white/10 transition-all">
                                        <Filter className="w-3.5 h-3.5" /> Filter Status
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/[0.02]">
                                            <th className="px-10 py-6 text-[9px] font-black text-white/30 uppercase tracking-[0.3em] border-b border-white/5">Asset Signature</th>
                                            <th className="px-10 py-6 text-[9px] font-black text-white/30 uppercase tracking-[0.3em] border-b border-white/5">Communication</th>
                                            <th className="px-10 py-6 text-[9px] font-black text-white/30 uppercase tracking-[0.3em] border-b border-white/5">Deployment State</th>
                                            <th className="px-10 py-6 text-[9px] font-black text-white/30 uppercase tracking-[0.3em] border-b border-white/5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {allDrivers.map(driver => (
                                            <tr key={driver._id} className="hover:bg-white/[0.03] transition-all group">
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 flex items-center justify-center font-black text-white shadow-inner group-hover:scale-110 transition-transform">
                                                            {driver.name[0]}
                                                        </div>
                                                        <div>
                                                            <span className="font-black text-white text-base tracking-tight block">{driver.name}</span>
                                                            <span className="text-[8px] text-white/20 font-black uppercase tracking-widest">{driver.profile?.vehicle?.model || 'Generic Asset'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <span className="font-medium text-white/40 text-xs tracking-tight">{driver.email}</span>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${driver.status === 'active' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
                                                            <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.15em] border ${driver.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                                driver.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                                }`}>
                                                                {driver.status}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${driver.isOnline ? 'bg-amber-400 animate-pulse' : 'bg-gray-600'}`} />
                                                            <span className={`text-[7px] font-black uppercase tracking-widest ${driver.isOnline ? 'text-amber-400' : 'text-gray-500'}`}>
                                                                {driver.isOnline ? 'LIVE ON GRID' : 'DISCONNECTED'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                        {(driver.location || driver.isOnline) && (
                                                            <button onClick={() => {
                                                                if (driver.location) setFocusLocation(driver.location);
                                                                setActiveTab('grid');
                                                            }} className="p-3 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500/20 transition-all border border-blue-500/20" title="Track Asset">
                                                                <Navigation className={`w-4 h-4 ${driver.isOnline ? 'animate-bounce' : ''}`} />
                                                            </button>
                                                        )}
                                                        {driver.status !== 'suspended' && (
                                                            <button onClick={() => handleSuspendUser(driver._id)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all border border-red-500/20" title="Deactivate">
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button className="p-3 bg-white/5 text-white/40 rounded-xl hover:bg-white/10 hover:text-white transition-all border border-white/5">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === "operations" && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {activeRides.length === 0 ? (
                                <div className="bg-white/5 backdrop-blur-3xl p-40 rounded-[5rem] border border-white/10 text-center shadow-inner">
                                    <Globe className="w-24 h-24 text-white/5 mx-auto mb-10 animate-pulse" />
                                    <h3 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase whitespace-nowrap">Grid Silence: Zero Active Vectors</h3>
                                    <p className="text-white/20 font-bold uppercase text-[11px] tracking-[0.4em]">Automated monitoring active • All mission parameters stable</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                                    {activeRides.map(ride => (
                                        <div key={ride._id} className="bg-white/5 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-white/10 shadow-2xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-700">
                                            <div className="absolute top-0 right-0 p-12">
                                                <span className="px-6 py-3 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-amber-500/20 backdrop-blur-xl shadow-inner">
                                                    {ride.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="mb-12">
                                                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-3">Mission Vector ID</p>
                                                <div className="flex items-center justify-between flex-wrap gap-4">
                                                    <p className="font-black text-white text-3xl tracking-tighter uppercase">RHX-{ride._id.slice(-6)}</p>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => trackRideOnMap(ride)}
                                                            className="p-3 bg-blue-500/10 rounded-2xl hover:bg-blue-500/20 transition-all text-blue-400 border border-blue-500/20 shadow-lg group-hover:scale-110 duration-300"
                                                            title="Track Vector"
                                                        >
                                                            <Navigation className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancelMission(ride._id)}
                                                            className="p-3 bg-red-500/10 rounded-2xl hover:bg-red-500/20 transition-all text-red-500 border border-red-500/20 shadow-lg group-hover:scale-110 duration-300"
                                                            title="Abort Mission"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-8 mb-12 relative">
                                                <div className="absolute left-10 top-2 bottom-2 w-0.5 bg-gradient-to-b from-emerald-500 via-white/5 to-red-500" />
                                                <div className="relative pl-24 group/loc">
                                                    <div className="absolute left-8 top-1.5 w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_20px_rgba(52,211,153,0.8)] border-4 border-black group-hover/loc:scale-125 transition-transform" />
                                                    <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">Origin Grid</p>
                                                    <p className="text-lg font-bold text-white leading-tight line-clamp-2 max-w-sm">{ride.pickup.address}</p>
                                                </div>
                                                <div className="relative pl-24 group/loc">
                                                    <div className="absolute left-8 top-1.5 w-4 h-4 rounded-full bg-red-500 shadow-[0_0_20px_rgba(248,113,113,0.8)] border-4 border-black group-hover/loc:scale-125 transition-transform" />
                                                    <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">Target Interface</p>
                                                    <p className="text-lg font-bold text-white leading-tight line-clamp-2 max-w-sm">{ride.dropoff.address}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-12 pt-10 border-t border-white/10 backdrop-blur-sm">
                                                <div>
                                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-2">Operational Pilot</p>
                                                    <p className="font-black text-white tracking-tight text-xl">{ride.driver?.name || 'SYNCING...'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-2">Contract Value</p>
                                                    <p className="font-black text-amber-500 text-4xl tracking-tighter drop-shadow-lg">₹{ride.fare}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "analytics" && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 bg-white/5 backdrop-blur-3xl rounded-[4rem] border border-white/10 p-12 shadow-inner h-[500px] flex flex-col">
                                    <h3 className="text-xl font-black text-white mb-10 flex items-center gap-4">
                                        <IndianRupee className="w-6 h-6 text-emerald-400" /> Revenue Flow Vectors
                                    </h3>
                                    <div className="flex-grow flex items-end gap-6 px-4">
                                        {[65, 45, 75, 55, 90, 70, 85].map((h, i) => (
                                            <div key={i} className="flex-grow group relative">
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">₹{h * 1.2}k</div>
                                                <div
                                                    style={{ height: `${h}%` }}
                                                    className="w-full bg-gradient-to-t from-amber-500/20 to-amber-500 rounded-2xl shadow-lg border border-white/10 group-hover:brightness-125 transition-all duration-500"
                                                />
                                                <div className="mt-4 text-[9px] font-black text-white/20 uppercase text-center">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white/5 backdrop-blur-3xl rounded-[4rem] border border-white/10 p-12 shadow-inner flex flex-col justify-center items-center gap-10">
                                    <div className="relative w-56 h-56">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="24" fill="transparent" className="text-white/5" />
                                            <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="24" fill="transparent" strokeDasharray="628" strokeDashoffset="180" className="text-amber-500" />
                                            <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="24" fill="transparent" strokeDasharray="628" strokeDashoffset="480" className="text-blue-500" />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <p className="text-4xl font-black text-white tracking-tighter">72%</p>
                                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Efficiency</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4 w-full">
                                        <div className="flex items-center justify-between text-[11px] font-bold">
                                            <span className="text-white/60 uppercase tracking-widest">Active Missions</span>
                                            <span className="text-amber-500">72%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div className="w-[72%] h-full bg-amber-500 rounded-full" />
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] font-bold">
                                            <span className="text-white/60 uppercase tracking-widest">System Load</span>
                                            <span className="text-blue-500">28%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div className="w-[28%] h-full bg-blue-500 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "settings" && config && (
                        <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="bg-white/5 backdrop-blur-3xl p-6 sm:p-16 rounded-[2rem] sm:rounded-[5rem] border border-white/10 shadow-inner space-y-12 sm:space-y-16">
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-black text-white mb-8 sm:mb-12 border-b border-white/10 pb-6 sm:pb-10 flex items-center gap-5">
                                        <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500" /> Core Logistical Protocols
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-12">
                                        <div className="space-y-5">
                                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] ml-4">Base Scalar Fare (₹)</label>
                                            <input
                                                type="number"
                                                value={config.fares.baseFare}
                                                onChange={e => setConfig({ ...config, fares: { ...config.fares, baseFare: Number(e.target.value) } })}
                                                className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-10 py-6 font-black text-xl text-white focus:bg-white/10 transition-all outline-none focus:ring-4 ring-amber-500/10 focus:border-amber-500/40"
                                            />
                                        </div>
                                        <div className="space-y-5">
                                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] ml-4">Radial Velocity Rate (₹/KM)</label>
                                            <input
                                                type="number"
                                                value={config.fares.perKm}
                                                onChange={e => setConfig({ ...config, fares: { ...config.fares, perKm: Number(e.target.value) } })}
                                                className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-10 py-6 font-black text-xl text-white focus:bg-white/10 transition-all outline-none focus:ring-4 ring-amber-500/10 focus:border-amber-500/40"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl sm:text-2xl font-black text-white mb-8 sm:mb-12 border-b border-white/10 pb-6 sm:pb-10 flex items-center gap-5">
                                        <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500" /> Revenue Vector Scalar
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-12">
                                        <div className="space-y-5">
                                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] ml-4">HQ Commission Retain (%)</label>
                                            <input
                                                type="number"
                                                value={config.commission.percentage}
                                                onChange={e => setConfig({ ...config, commission: { ...config.commission, percentage: Number(e.target.value) } })}
                                                className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-10 py-6 font-black text-xl text-white focus:bg-white/10 transition-all outline-none focus:ring-4 ring-emerald-500/10 focus:border-emerald-500/40"
                                            />
                                        </div>
                                        <div className="space-y-5">
                                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] ml-4">Surge Flux Multiplier</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={config.fares.surgeMultiplier}
                                                onChange={e => setConfig({ ...config, fares: { ...config.fares, surgeMultiplier: Number(e.target.value) } })}
                                                className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-10 py-6 font-black text-xl text-white focus:bg-white/10 transition-all outline-none focus:ring-4 ring-orange-500/10 focus:border-orange-500/40"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={updateConfig}
                                    className="w-full h-24 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-2xl uppercase tracking-[0.3em] transition-all shadow-2xl shadow-amber-500/40 mt-10 active:scale-95 border-b-8 border-orange-900/50"
                                >
                                    Commit Architectural Changes
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
