import React, { useState } from "react";
import { AlertTriangle, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function SOSButton({ rideId, onActivate, isActivated }) {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isActivating, setIsActivating] = useState(false);

    const handleActivate = async () => {
        setIsActivating(true);
        try {
            await onActivate(rideId);
            setShowConfirmation(false);
        } catch (error) {
            console.error("Error activating SOS:", error);
            alert("Failed to activate SOS");
        } finally {
            setIsActivating(false);
        }
    };

    if (isActivated) {
        return (
            <div className="fixed bottom-10 right-10 z-[10000] animate-in zoom-in duration-500">
                <div className="bg-red-500/20 backdrop-blur-2xl text-red-500 px-10 py-5 rounded-[2rem] border-2 border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.4)] animate-pulse flex items-center gap-4">
                    <AlertTriangle className="w-8 h-8" />
                    <div className="flex flex-col">
                        <span className="font-black text-xs uppercase tracking-[0.2em] leading-none mb-1 text-red-400">System Priority</span>
                        <span className="font-black text-xl tracking-tighter uppercase leading-none">Emergency Live</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <button
                onClick={() => setShowConfirmation(true)}
                className="w-full bg-red-600/10 hover:bg-red-600/20 border-2 border-red-600/20 hover:border-red-600/40 text-red-500 py-6 px-8 rounded-[2.5rem] shadow-2xl transition-all duration-500 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4 group relative overflow-hidden"
                title="Emergency SOS"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/5 to-red-600/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <div className="bg-red-600/20 p-3 rounded-2xl group-hover:bg-red-600/30 transition-all shadow-inner relative z-10">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div className="text-left relative z-10">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] block leading-none mb-1 opacity-60">Critical Protocol</span>
                    <span className="font-black text-sm uppercase tracking-widest block">SOS Emergency</span>
                </div>
            </button>

            <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
                <DialogContent className="sm:max-w-md bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
                    <DialogHeader className="space-y-4">
                        <div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center mx-auto border border-red-600/30">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <DialogTitle className="text-3xl font-black text-white text-center tracking-tighter uppercase">
                            Emergency?
                        </DialogTitle>
                        <DialogDescription className="text-white/40 font-black text-[10px] uppercase tracking-[0.2em] text-center">
                            Confirm Crisis Protocol Activation
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-8">
                        <div className="bg-white/5 border border-white/10 rounded-[30px] p-8 space-y-4 shadow-inner">
                            <p className="text-[11px] text-white/60 font-black uppercase tracking-widest mb-2 border-b border-white/5 pb-4">
                                System Response Plan:
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-4 text-white/80">
                                    <div className="p-1.5 bg-red-600/20 rounded-lg"><MapPin className="w-4 h-4 text-red-500" /></div>
                                    <span className="text-sm font-bold">Transmit Precise Grid Coordinates</span>
                                </li>
                                <li className="flex items-start gap-4 text-white/80">
                                    <div className="p-1.5 bg-red-600/20 rounded-lg"><Phone className="w-4 h-4 text-red-500" /></div>
                                    <span className="text-sm font-bold">Connect to Emergency Dispatch</span>
                                </li>
                                <li className="flex items-start gap-4 text-white/80">
                                    <div className="p-1.5 bg-red-600/20 rounded-lg"><AlertTriangle className="w-4 h-4 text-red-500" /></div>
                                    <span className="text-sm font-bold">Escalate Ride Priority to Omega</span>
                                </li>
                            </ul>
                        </div>

                        <p className="text-[10px] text-white/30 font-bold text-center uppercase tracking-widest">
                            Proceed only if safety is compromised.
                        </p>
                    </div>

                    <DialogFooter className="flex gap-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowConfirmation(false)}
                            disabled={isActivating}
                            className="flex-1 py-7 rounded-2xl bg-white/5 border-white/10 text-white font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                        >
                            Abort
                        </Button>
                        <Button
                            onClick={handleActivate}
                            disabled={isActivating}
                            className="flex-1 py-7 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest shadow-xl shadow-red-600/20 active:scale-95 transition-all"
                        >
                            {isActivating ? "Engaging..." : "Activate SOS"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
