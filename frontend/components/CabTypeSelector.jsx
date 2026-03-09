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
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
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
                relative flex items-center gap-6 p-4 md:p-5 rounded-[2rem] border transition-all duration-500 w-full overflow-hidden group
                ${isSelected
                                    ? "border-primary bg-primary/10 shadow-[0_15px_40px_rgba(255,153,0,0.15)] scale-[1.02]"
                                    : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:scale-[1.01] shadow-xl"
                                }
              `}
                        >
                            {/* Cinematic Background Gradient for active state */}
                            {isSelected && (
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-orange-500/10 to-transparent animate-plus-pulse" />
                            )}

                            {/* Content Wrapper */}
                            <div className="flex items-center gap-6 relative z-10 w-full">
                                {/* Icon wrapper */}
                                <div className={`
                                    w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-3xl md:text-4xl transition-all duration-500 flex-shrink-0
                                    ${isSelected ? "bg-primary shadow-[0_0_25px_rgba(255,153,0,0.4)] scale-110" : "bg-black/20 group-hover:scale-110 shadow-inner"}
                                `}>
                                    {cab.icon}
                                </div>

                                {/* Name + details */}
                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`text-lg md:text-xl font-black leading-none uppercase tracking-tighter truncate ${isSelected ? "text-primary" : "text-white"}`}>
                                            {cab.name}
                                        </h3>
                                        <div className="text-right flex-shrink-0">
                                            {estimatedFare && (
                                                <p className={`text-xl font-black leading-none ${isSelected ? "text-white" : "text-primary"}`}>
                                                    ₹{estimatedFare}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className={`text-[10px] font-black uppercase tracking-widest leading-none ${isSelected ? "text-white/70" : "text-white/40"}`}>
                                            {cab.capacity}
                                        </p>
                                        <span className="w-1 h-1 rounded-full bg-white/10" />
                                        <p className={`text-[9px] font-bold uppercase tracking-tight leading-none truncate ${isSelected ? "text-white/40" : "text-white/20"}`}>
                                            ₹{cab.ratePerKm}/km
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
