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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
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
                relative flex flex-col items-center justify-between text-center p-5 md:p-6 rounded-[32px] border transition-all duration-500 w-full aspect-[4/5] sm:aspect-square overflow-hidden group
                ${isSelected
                                    ? "border-primary bg-primary/10 shadow-[0_20px_50px_rgba(255,153,0,0.25)] scale-105"
                                    : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] shadow-2xl"
                                }
              `}
                        >
                            {/* Cinematic Background Gradient for active state */}
                            {isSelected && (
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-orange-500/15 to-transparent animate-plus-pulse" />
                            )}

                            {/* Selected checkmark badge */}
                            {isSelected && (
                                <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg border-2 border-white/20 z-20 animate-in zoom-in-50 duration-300">
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}

                            {/* Content Wrapper */}
                            <div className="flex flex-col items-center gap-2 md:gap-3 relative z-10 w-full pt-2">
                                {/* Icon bubble */}
                                <div className={`
                                    w-14 h-14 md:w-16 md:h-16 rounded-[20px] flex items-center justify-center text-4xl md:text-5xl transition-all duration-500
                                    ${isSelected ? "bg-primary shadow-[0_0_30px_rgba(255,153,0,0.4)] scale-110" : "bg-black/20 group-hover:scale-110 shadow-inner"}
                                `}>
                                    {cab.icon}
                                </div>

                                {/* Name + details */}
                                <div className="space-y-0.5 md:space-y-1 w-full overflow-hidden">
                                    <h3 className={`text-base md:text-lg font-black leading-none uppercase tracking-tight truncate ${isSelected ? "text-primary" : "text-white"}`}>
                                        {cab.name}
                                    </h3>
                                    <p className={`text-[9px] font-black uppercase tracking-widest leading-none ${isSelected ? "text-white/70" : "text-white/30"}`}>
                                        {cab.capacity}
                                    </p>
                                    <p className={`text-[8px] font-bold uppercase tracking-tighter leading-tight line-clamp-2 px-1 ${isSelected ? "text-white/40" : "text-white/10"}`}>
                                        {cab.description}
                                    </p>
                                </div>
                            </div>

                            {/* Pricing Section */}
                            <div className={`w-full pt-3 border-t relative z-10 ${isSelected ? "border-primary/30" : "border-white/10"}`}>
                                <div className="flex justify-between items-end">
                                    <div className="text-left">
                                        <p className={`text-[7px] font-black uppercase tracking-widest ${isSelected ? "text-primary" : "text-white/20"}`}>
                                            Base
                                        </p>
                                        <p className={`text-sm font-black whitespace-nowrap ${isSelected ? "text-white" : "text-white/80"}`}>
                                            ₹{cab.ratePerKm}<span className="text-[9px] text-white/30 font-bold">/km</span>
                                        </p>
                                    </div>
                                    {estimatedFare && (
                                        <div className="text-right">
                                            <p className={`text-[7px] font-black uppercase tracking-widest ${isSelected ? "text-primary" : "text-white/20"}`}>
                                                Mission
                                            </p>
                                            <p className={`text-xl font-black leading-none ${isSelected ? "text-white" : "text-primary"}`}>
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
