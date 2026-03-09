import React from "react";

const cabTypes = [
    {
        id: "Mini",
        name: "Mini",
        icon: "🚗",
        capacity: "4 seats",
        ratePerKm: 12,
        description: "Affordable compact cars",
    },
    {
        id: "Sedan",
        name: "Sedan",
        icon: "🚙",
        capacity: "4 seats",
        ratePerKm: 15,
        description: "Comfortable sedans",
    },
    {
        id: "SUV",
        name: "SUV",
        icon: "🚐",
        capacity: "6–7 seats",
        ratePerKm: 20,
        description: "Spacious SUVs",
    },
    {
        id: "Auto",
        name: "Auto",
        icon: "🛺",
        capacity: "3 seats",
        ratePerKm: 9,
        description: "Affordable auto rickshaws",
    },
    {
        id: "Bike",
        name: "Bike",
        icon: "🏍️",
        capacity: "1 seat",
        ratePerKm: 6,
        description: "Quick bike rides",
    },
];

export default function CabTypeSelector({ selectedCabType, onSelectCabType, distance }) {
    return (
        <div className="rounded-[40px] bg-black/40 backdrop-blur-3xl border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.5)] p-10 space-y-8 animate-in fade-in duration-700">
            <div className="space-y-2">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">
                    Select Fleet
                </h3>
                <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.2em]">Deployment Tier Selection</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cabTypes.map((cab) => {
                    const isSelected = selectedCabType === cab.id;
                    const estimatedFare = distance
                        ? Math.round(parseFloat(distance.replace(/[^\d.]/g, "")) * cab.ratePerKm)
                        : null;

                    return (
                        <button
                            key={cab.id}
                            onClick={() => onSelectCabType(cab.id)}
                            className={`
                relative flex flex-col items-center text-center gap-6 p-8 rounded-[32px] border transition-all duration-500 w-full overflow-hidden group
                ${isSelected
                                    ? "border-primary bg-primary/10 shadow-[0_15px_40px_rgba(255,153,0,0.2)] scale-105"
                                    : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] shadow-2xl"
                                }
              `}
                        >
                            {/* Cinematic Background Gradient for active state */}
                            {isSelected && (
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-orange-500/10 to-transparent animate-plus-pulse" />
                            )}

                            {/* Selected checkmark badge */}
                            {isSelected && (
                                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg border-2 border-white/20">
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}

                            {/* Icon bubble */}
                            <div className={`
                                w-20 h-20 rounded-[24px] flex items-center justify-center text-5xl transition-all duration-500 relative z-10
                                ${isSelected ? "bg-primary shadow-[0_0_30px_rgba(255,153,0,0.3)] scale-110" : "bg-black/20 group-hover:scale-110 shadow-inner"}
                            `}>
                                {cab.icon}
                            </div>

                            {/* Name + description */}
                            <div className="space-y-1 relative z-10">
                                <h3 className={`text-xl font-black leading-tight uppercase tracking-tight ${isSelected ? "text-primary" : "text-white"}`}>
                                    {cab.name}
                                </h3>
                                <p className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? "text-white/60" : "text-white/20"}`}>
                                    {cab.capacity} • {cab.description}
                                </p>
                            </div>

                            {/* Pricing */}
                            <div className={`w-full pt-6 border-t relative z-10 ${isSelected ? "border-primary/30" : "border-white/5"}`}>
                                <div className="flex justify-between items-end">
                                    <div className="text-left">
                                        <p className={`text-[8px] font-black uppercase tracking-[0.2em] mb-1 ${isSelected ? "text-primary" : "text-white/20"}`}>
                                            Base Rate
                                        </p>
                                        <p className={`text-base font-black ${isSelected ? "text-white" : "text-white/80"}`}>
                                            ₹{cab.ratePerKm}<span className="text-[10px] text-white/30">/km</span>
                                        </p>
                                    </div>
                                    {estimatedFare && (
                                        <div className="text-right">
                                            <p className={`text-[8px] font-black uppercase tracking-[0.2em] mb-1 ${isSelected ? "text-primary" : "text-white/20"}`}>
                                                Est. Mission
                                            </p>
                                            <p className={`text-2xl font-black ${isSelected ? "text-white" : "text-primary"}`}>
                                                ₹{estimatedFare}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
