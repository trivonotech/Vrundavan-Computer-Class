import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { ShieldAlert, Lock, Clock } from 'lucide-react';

const SecurityMonitor = ({ children }) => {
    const [blockedUntil, setBlockedUntil] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [settings, setSettings] = useState({
        enabled: false,
        maxReloads: 5,
        timeWindow: 10,
        blockDuration: 30
    });
    const [loading, setLoading] = useState(true);

    // 1. Check Admin Settings (Firebase)
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "settings", "security"), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setSettings({
                    enabled: data.enabled === true,
                    maxReloads: data.maxReloads || 5,
                    timeWindow: data.timeWindow || 10,
                    blockDuration: data.blockDuration || 30
                });
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);

    // 2. Logic: Reload Counting & Blocking
    useEffect(() => {
        if (loading || !settings.enabled) return;

        const now = Date.now();
        const durationMs = settings.blockDuration * 60 * 1000;

        // Check if already blocked (Dynamic Duration Logic)
        const blockStart = localStorage.getItem('security_block_start');
        if (blockStart) {
            const startTime = parseInt(blockStart, 10);
            const elapsed = now - startTime;

            if (elapsed < durationMs) {
                // Still blocked
                setBlockedUntil(startTime + durationMs);
                return;
            } else {
                // Block expired
                localStorage.removeItem('security_block_start');
                setBlockedUntil(null);
            }
        }

        let reloads = JSON.parse(localStorage.getItem('security_reloads') || '[]');

        // Filter out old timestamps based on dynamic Time Window
        const windowMs = settings.timeWindow * 1000;
        reloads = reloads.filter(time => now - time < windowMs);

        // Add current timestamp
        reloads.push(now);

        // Save back
        localStorage.setItem('security_reloads', JSON.stringify(reloads));

        // Check dynamic limit
        if (reloads.length > settings.maxReloads) {
            // Trigger new block
            localStorage.setItem('security_block_start', now.toString());
            setBlockedUntil(now + durationMs);
            localStorage.removeItem('security_reloads');
        }

    }, [loading, settings]);

    // 3. Countdown Timer for UI
    useEffect(() => {
        if (!blockedUntil) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, blockedUntil - now);
            setTimeLeft(remaining);

            // Auto-check if settings changed and unblocked us
            // (e.g. admin changed duration from 30min to 1min while we were waiting)
            const blockStart = localStorage.getItem('security_block_start');
            if (blockStart) {
                const startTime = parseInt(blockStart, 10);
                const durationMs = settings.blockDuration * 60 * 1000;
                if (now - startTime >= durationMs) {
                    setBlockedUntil(null);
                    localStorage.removeItem('security_block_start');
                    window.location.reload();
                }
            } else if (remaining <= 0) {
                // Fallback catch
                setBlockedUntil(null);
                window.location.reload();
            }

        }, 1000);

        return () => clearInterval(interval);
    }, [blockedUntil, settings]);

    // Format time helper
    const formatTime = (ms) => {
        const m = Math.floor(ms / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (loading) return null; // Or legitimate loading spinner? Let's just render children to avoid flash? No, better safe.

    if (blockedUntil) {
        return (
            <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-500 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #1e293b 0%, #020617 100%)' }}></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>

                <div className="bg-slate-900/50 p-8 md:p-12 rounded-3xl backdrop-blur-2xl border border-white/5 max-w-lg w-full shadow-2xl relative z-10">

                    {/* Icon with Ring Animation */}
                    <div className="relative w-24 h-24 mx-auto mb-8">
                        <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
                        <div className="absolute inset-0 bg-red-500/10 rounded-full animate-pulse"></div>
                        <div className="relative bg-slate-900 border border-red-500/50 text-red-500 w-full h-full rounded-full flex items-center justify-center shadow-[0_0_30px_-5px_rgba(239,68,68,0.3)]">
                            <ShieldAlert size={40} strokeWidth={1.5} />
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">Security Alert</h1>
                    <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                        Unusual traffic detected from your connection. <br className="hidden md:block" /> Access has been temporarily restricted.
                    </p>

                    {/* Timer Card */}
                    <div className="bg-black/40 rounded-2xl p-6 border border-white/5 mb-8 flex flex-col items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Access Restored In</span>
                        <div className="font-mono text-4xl md:text-5xl font-bold text-white tabular-nums tracking-wider flex items-center gap-3">
                            <Clock size={28} className="text-red-500 animate-pulse" />
                            {formatTime(timeLeft)}
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs text-slate-600 font-medium uppercase tracking-widest">
                        <Lock size={12} />
                        <span>Protected by Security Shield</span>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default SecurityMonitor;
