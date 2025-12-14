import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Ban } from 'lucide-react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AccessDenied = () => {
    const [timeLeft, setTimeLeft] = useState(null); // Init null to show loading or blocking state

    useEffect(() => {
        const handleBlockLogic = async () => {
            const now = Date.now();
            const storedEndTime = localStorage.getItem('access_block_until');

            // 1. Check if an active block already exists
            if (storedEndTime && parseInt(storedEndTime) > now) {
                setTimeLeft(Math.ceil((parseInt(storedEndTime) - now) / 1000));
                return;
            }

            // 2. If no active block, fetch settings and create one
            try {
                const docRef = doc(db, "settings", "security");
                const docSnap = await getDoc(docRef);
                const durationMinutes = (docSnap.exists() && docSnap.data().blockDurationMinutes)
                    ? docSnap.data().blockDurationMinutes
                    : 30; // Default 30 mins

                const newEndTime = now + (durationMinutes * 60 * 1000);
                localStorage.setItem('access_block_until', newEndTime.toString());
                setTimeLeft(durationMinutes * 60);
            } catch (error) {
                console.error("Error init block:", error);
                // Fallback default
                const newEndTime = now + (30 * 60 * 1000);
                localStorage.setItem('access_block_until', newEndTime.toString());
                setTimeLeft(30 * 60);
            }
        };

        handleBlockLogic();

        const timer = setInterval(() => {
            const storedEndTime = localStorage.getItem('access_block_until');
            if (storedEndTime) {
                const remaining = Math.ceil((parseInt(storedEndTime) - Date.now()) / 1000);
                if (remaining <= 0) {
                    localStorage.removeItem('access_block_until');
                    setTimeLeft(0);
                    // Optionally redirect home here if we wanted auto-unblock
                } else {
                    setTimeLeft(remaining);
                }
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (timeLeft === null) return null; // Avoid flash

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-mono text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/40 via-transparent to-transparent"></div>
            </div>

            <div className="max-w-xl w-full relative z-10">
                {/* Shield Icon */}
                <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-8 ring-4 ring-red-500/20 animate-pulse">
                    <ShieldAlert className="text-red-500" size={48} />
                </div>

                <h1 className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tighter uppercase">
                    Access <span className="text-red-500">Denied</span>
                </h1>
                <p className="text-slate-400 mb-8 uppercase tracking-widest text-xs font-bold">Error 403 • Forbidden</p>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-sm">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900"></div>

                    <h2 className="text-white font-bold text-xl mb-3 flex items-center justify-center gap-2">
                        <AlertTriangle size={20} className="text-amber-500" />
                        Security Firewall Activated
                    </h2>

                    <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                        Our systems have detected unusual traffic patterns from your IP address.
                    </p>

                    <div className="bg-slate-950/50 rounded-lg py-4 px-6 mb-2 inline-flex items-center gap-4 border border-slate-800">
                        <Ban size={20} className="text-red-500" />
                        <div className="text-left">
                            <p className="text-xs text-slate-500 uppercase font-semibold">Temporary Block</p>
                            <span className="text-white font-mono text-lg font-bold tracking-wider">
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    </div>
                </div>

                <p className="text-slate-500 text-xs mt-8 max-w-sm mx-auto leading-relaxed">
                    This action is reversible automatically. Please wait for the timer to expire.
                </p>
            </div>
        </div>
    );
};

export default AccessDenied;
