import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  ArrowLeft,
  Star,
  MessageSquare,
  Download,
  Filter,
  Calendar,
  Clock,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import RatingModal from "@/components/RatingModal";
import { downloadInvoice } from "@/lib/invoiceGenerator";
import { toast } from "sonner";
import { getApiUrl } from "@/utils/api";

export default function RideHistory() {
  const { user } = useApp();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [selectedRideForRating, setSelectedRideForRating] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      const response = await fetch(getApiUrl("/api/rides"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRides(data);
      } else {
        console.error("Failed to fetch rides");
      }
    } catch (error) {
      console.error("Error fetching rides:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (rideId) => {
    try {
      const token = sessionStorage.getItem("authToken");
      const response = await fetch(getApiUrl(`/api/rides/${rideId}/invoice`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const invoiceData = await response.json();
        downloadInvoice(invoiceData);
        toast.success("Invoice downloaded successfully!");
      } else {
        toast.error("Failed to generate invoice");
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Error downloading invoice");
    }
  };

  const handleRateRide = (ride) => {
    setSelectedRideForRating(ride);
    setShowRatingModal(true);
  };

  const handleSubmitRating = async (rating, feedback) => {
    try {
      const token = sessionStorage.getItem("authToken");
      const response = await fetch(getApiUrl(`/api/rides/${selectedRideForRating._id}/rating`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, feedback }),
      });

      if (response.ok) {
        toast.success("Rating submitted successfully!");
        fetchRides(); // Refresh rides to show updated rating
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to submit rating");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Error submitting rating");
    }
  };

  const filteredRides = rides.filter((ride) => {
    if (filterType === "all") return true;
    if (filterType === "completed") return ride.status === "completed";
    if (filterType === "scheduled") return ride.isScheduled;
    if (filterType === "cancelled") return ride.status === "cancelled";
    return true;
  });

  const totalRides = filteredRides.length;
  const totalSpent = filteredRides.reduce((sum, ride) => sum + (ride.fare || 0), 0);
  const completedRides = filteredRides.filter((r) => r.status === "completed");
  const avgRating = completedRides.length > 0
    ? (completedRides.reduce((sum, r) => sum + (r.rating || 0), 0) / completedRides.filter(r => r.rating).length).toFixed(2)
    : "N/A";

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading ride history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col bg-gray-950 overflow-x-hidden font-sans selection:bg-amber-500 selection:text-white">
      {/* Background Image with Overlay */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center transition-transform duration-1000 scale-105 opacity-20"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&q=80&w=2000')",
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-gray-950/90 via-gray-900/60 to-gray-950/90 backdrop-blur-[2px]" />

      {/* Header */}
      <div className="relative z-40 border-b border-white/10 bg-gray-950/50 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/home"
            className="flex items-center gap-2 group transition"
          >
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-gray-950 transition-all duration-300">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-bold text-white uppercase tracking-widest text-[10px]">Back to Dashboard</span>
          </Link>
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Wee<span className="text-amber-500">Fly</span> History</h1>
            <p className="text-[8px] font-black text-amber-500/60 uppercase tracking-[0.4em] mt-1">Operational Log Database</p>
          </div>
          <div className="w-32"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {[
            {
              label: "Total Missions",
              value: totalRides,
              icon: "https://images.unsplash.com/photo-1549421484-a42d3c7849cf?auto=format&fit=crop&q=80&w=300",
              color: "text-blue-400",
            },
            {
              label: "Financial Flow",
              value: `₹${totalSpent}`,
              icon: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=300",
              color: "text-amber-500",
            },
            {
              label: "Asset Rating",
              value: avgRating,
              icon: "https://images.unsplash.com/photo-1503387762-592dea58ef23?auto=format&fit=crop&q=80&w=300",
              color: "text-yellow-400",
            },
            {
              label: "Completed",
              value: completedRides.length,
              icon: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=300",
              color: "text-emerald-400",
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="group relative rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-8 transition-all duration-500 hover:border-amber-500/30 hover:bg-white/10 overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-24 h-24 opacity-20 transition-all duration-500 group-hover:scale-125 group-hover:opacity-40">
                <img src={stat.icon} className="w-full h-full object-cover rounded-bl-full" alt="" />
              </div>
              <div className="relative">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-2">{stat.label}</p>
                <p className={`text-4xl font-black text-white tracking-tighter drop-shadow-lg group-hover:scale-110 transition-transform origin-left`}>
                  {stat.value}
                </p>
                <div className="mt-4 w-12 h-1 bg-amber-500/20 rounded-full group-hover:bg-amber-500 transition-colors" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">Operational Logs</h2>
            <div className="mt-2 flex items-center gap-2">
              <span className="w-12 h-0.5 bg-amber-500"></span>
              <p className="text-[10px] font-black text-amber-500/60 uppercase tracking-[0.4em]">Grid Deployment History</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 backdrop-blur-md">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent border-none outline-none text-white font-black text-xs uppercase tracking-widest cursor-pointer py-2 pr-8"
            >
              <option value="all" className="bg-gray-900">All Deployments</option>
              <option value="completed" className="bg-gray-900">Completed</option>
              <option value="scheduled" className="bg-gray-900">Scheduled</option>
              <option value="cancelled" className="bg-gray-900">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Rides List */}
        <div className="space-y-4">
          {filteredRides.map((ride) => (
            <div
              key={ride._id}
              className="group relative rounded-[2.5rem] border border-white/5 bg-white/5 backdrop-blur-2xl hover:bg-white/[0.08] hover:border-amber-500/30 hover:scale-[1.01] transition-all duration-500 p-8 shadow-2xl overflow-hidden"
            >
              {/* Card Detail Lines */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/5 blur-3xl rounded-full" />

              <div className="grid md:grid-cols-4 gap-8 items-center relative">
                {/* Journey Details */}
                <div className="md:col-span-1 border-r border-white/10 pr-8">
                  <div className="space-y-6 relative">
                    <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-amber-500/50 via-white/10 to-blue-500/50" />
                    <div className="flex items-start gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
                      <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)] border-2 border-gray-900 mt-1 flex-shrink-0 z-10" />
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Origin Grid</p>
                        <p className="text-xs font-bold text-white leading-relaxed line-clamp-2">{ride.pickup.address}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
                      <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] border-2 border-gray-900 mt-1 flex-shrink-0 z-10" />
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Destination</p>
                        <p className="text-xs font-bold text-white leading-relaxed line-clamp-2">{ride.dropoff.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="space-y-4 px-4">
                  <div>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] mb-2">Asset Details</p>
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-white uppercase tracking-widest">{ride.cabType || "Sedan"}</div>
                      <p className="text-amber-500 font-bold text-xs">{ride.distance}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Deployment Date</p>
                      <p className="text-[10px] font-bold text-white/70 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-amber-500/50" />
                        {formatDate(ride.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Time Loop</p>
                      <p className="text-[10px] font-bold text-white/70 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-amber-500/50" />
                        {formatTime(ride.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status & Feedback */}
                <div className="flex flex-col items-center justify-center space-y-4">
                  <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border backdrop-blur-md shadow-lg transition-all duration-500 group-hover:scale-110 ${ride.status === "completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    ride.status === "cancelled" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                      "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    }`}>
                    {ride.status}
                  </span>
                  {ride.rating ? (
                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < ride.rating ? "fill-amber-500 text-amber-500" : "text-white/10"}`} />
                        ))}
                      </div>
                      <span className="text-xs font-black text-white/50">{ride.rating}/5</span>
                    </div>
                  ) : ride.status === "completed" && (
                    <p className="text-[9px] font-black text-amber-500/40 uppercase tracking-widest animate-pulse">Pending Review</p>
                  )}
                </div>

                {/* Actions & Fare */}
                <div className="flex flex-col items-end gap-6">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-1">Contract Fare</p>
                    <p className="text-4xl font-black text-white tracking-tighter drop-shadow-lg group-hover:text-amber-500 transition-colors">₹{ride.fare}</p>
                  </div>

                  {ride.status === "completed" && (
                    <div className="flex gap-2 w-full max-w-[160px]">
                      <Button
                        onClick={() => handleDownloadInvoice(ride._id)}
                        className="flex-grow h-12 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl transition-all active:scale-95 group/btn"
                      >
                        <Download className="w-4 h-4 group-hover/btn:text-amber-500 transition-colors" />
                      </Button>
                      {!ride.rating && (
                        <Button
                          onClick={() => handleRateRide(ride)}
                          className="flex-[2] h-12 bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          Rate <Star className="w-3 h-3 fill-gray-950" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredRides.length === 0 && (
          <div className="rounded-[4rem] border-2 border-dashed border-white/10 bg-white/5 backdrop-blur-3xl p-24 text-center space-y-6 animate-in zoom-in-95 duration-700">
            <div className="text-7xl opacity-20 grayscale">📭</div>
            <div className="space-y-2">
              <p className="text-3xl font-black text-white tracking-tighter uppercase italic">Grid Index Empty</p>
              <p className="text-white/20 font-bold uppercase text-[10px] tracking-[0.5em]">
                {filterType === "all"
                  ? "No operational data found in the deployment logs"
                  : `No ${filterType} vectors detected in the matrix`}
              </p>
            </div>
            <Link to="/home">
              <Button className="h-16 px-12 bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 mt-6">
                Initialize New Deployment
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {showRatingModal && selectedRideForRating && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedRideForRating(null);
          }}
          ride={selectedRideForRating}
          onSubmit={handleSubmitRating}
        />
      )}
    </div>
  );
}
