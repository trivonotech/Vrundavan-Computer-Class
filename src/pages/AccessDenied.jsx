import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Ban } from 'lucide-react';
import { Link } from 'react-router-dom';

const AccessDenied = () => {
    const [timeLeft, setTimeLeft] = useState(1600); // ~26 mins in seconds

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    return (
        <div className="min-h-screen bg-[#380e0e] flex items-center justify-center p-4 font-mono text-center">
            <div className="max-w-xl w-full">
                {/* Shield Icon */}
                <div className="w-24 h-24 bg-[#5c1c1c] rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                    <ShieldAlert className="text-[#ff4444]" size={48} />
                </div>

                <h1 className="text-5xl md:text-6xl font-black text-[#ff4444] mb-8 tracking-tighter uppercase">
                    Access Denied
                </h1>

                <div className="bg-[#2a0a0a] border border-[#5c1c1c] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff4444] to-[#990000]"></div>

                    <h2 className="text-white font-bold text-xl mb-2 flex items-center justify-center gap-2">
                        <AlertTriangle size={20} className="text-[#ff4444]" />
                        System Protective Firewall Activated
                    </h2>

                    <p className="text-[#ffaaaa] text-sm mb-6">
                        High Rate Traffic / Spamming Detected from your IP
                    </p>

                    <div className="bg-[#1a0505] rounded-lg py-3 px-4 mb-2 inline-flex items-center gap-3 border border-[#3d1212]">
                        <Ban size={16} className="text-[#ff4444]" />
                        <span className="text-[#ff4444] text-sm font-semibold tracking-wider">
                            IP Block Active for: <span className="text-white">{formatTime(timeLeft)}</span>
                        </span>
                    </div>
                </div>

                <p className="text-[#884444] text-xs mt-8 max-w-sm mx-auto leading-relaxed">
                    Your actions triggered our automated defense system. Please stop rapid refreshing or automated requests.
                </p>

                {/* Hidden Home Link for legitimate users who got stuck */}
                <div className="mt-12 opacity-20 hover:opacity-100 transition-opacity">
                    <Link to="/" className="text-[#ff4444] text-xs underline">Return to Home</Link>
                </div>
            </div>
        </div>
    );
};

export default AccessDenied;
