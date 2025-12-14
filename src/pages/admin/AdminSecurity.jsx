import React, { useState, useEffect } from 'react';
import { Save, Shield, ShieldAlert, Clock, AlertTriangle, CheckCircle, Info, Lock } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const AdminSecurity = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState(null);
    const [settings, setSettings] = useState({
        enabled: false,
        maxReloads: 5,
        timeWindow: 10, // seconds
        blockDuration: 30 // minutes
    });

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, "settings", "security");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setSettings({ ...settings, ...docSnap.data() });
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            setSettings(prev => ({ ...prev, [name]: checked }));
            return;
        }

        // Allow empty string to let user clear input
        if (value === '') {
            setSettings(prev => ({ ...prev, [name]: '' }));
            return;
        }

        // Parse valid numbers, but maintain string if it ends with decimal point (e.g. "5.")
        // to allow typing decimals. Actually standard number inputs manage this well, 
        // but let's just use the value as-is if it's a number-like string, 
        // OR just parse it. parseFloat is fine, but "5." parses to 5, so typing "." might loop.
        // Better: Store as string or raw value in state, and only strict parse on submit?
        // Let's stick to: if it parses, use number, UNLESS it ends in decimal or is just empty.
        // Actually, for number inputs, 'value' returned by React is usually the string.
        setSettings(prev => ({
            ...prev,
            [name]: value // Keep as string to avoid cursor jumping or formatting issues while typing
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        // Sanitize: Ensure numbers are actually numbers before saving
        const sanitizedSettings = {
            ...settings,
            maxReloads: Number(settings.maxReloads) || 5,
            timeWindow: Number(settings.timeWindow) || 10,
            blockDuration: Number(settings.blockDuration) || 30
        };

        try {
            await setDoc(doc(db, "settings", "security"), sanitizedSettings, { merge: true });
            // Update local state to match sanitized versions (optional, but good for UI consistency)
            setSettings(sanitizedSettings);
            setNotification({ type: 'success', message: 'Security settings updated!' });
        } catch (error) {
            console.error("Error saving settings:", error);
            setNotification({ type: 'error', message: 'Failed to save settings.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 relative pb-20">
            {/* Notification Toast */}
            {notification && (
                <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 transform transition-all duration-300 z-50 animate-fade-in-up ${notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    <span className="font-medium">{notification.message}</span>
                </div>
            )}

            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-3">
                    <Shield className="text-blue-600" size={32} />
                    Security Shield
                </h1>
                <p className="text-slate-500 max-w-lg mx-auto">Configurable DDoS protection and anti-spam system. Adjust the sensitivity thresholds below.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* System Lockdown / Maintenance Mode */}
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${settings.lockdown ? 'bg-red-500 text-white' : 'bg-red-100 text-red-500'}`}>
                            <Lock size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">System Lockdown</h3>
                            <p className="text-sm text-slate-600 max-w-md">
                                Activate <strong>Maintenance Mode</strong>. This will block access to the public website and show a maintenance message to all visitors. Admin panel remains accessible.
                            </p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            name="lockdown"
                            checked={settings.lockdown || false}
                            onChange={async (e) => {
                                const isChecked = e.target.checked;
                                // Optimistic update
                                setSettings(prev => ({ ...prev, lockdown: isChecked }));
                                try {
                                    await setDoc(doc(db, "settings", "security"), { ...settings, lockdown: isChecked }, { merge: true });
                                    setNotification({ type: 'success', message: `System Lockdown ${isChecked ? 'ACTIVATED' : 'DEACTIVATED'}` });
                                } catch (error) {
                                    console.error("Error toggling lockdown:", error);
                                    setNotification({ type: 'error', message: "Failed to toggle lockdown" });
                                    // Revert on error
                                    setSettings(prev => ({ ...prev, lockdown: !isChecked }));
                                }
                            }}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-100 rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                </div>

                {/* Master Switch */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${settings.enabled ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">System Status</h3>
                            <p className="text-sm text-slate-500">{settings.enabled ? 'Security Shield is ACTIVE' : 'Security Shield is DISABLED'}</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            name="enabled"
                            checked={settings.enabled}
                            onChange={handleChange}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                </div>

                {/* Settings Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Max Reloads */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                        <div className="flex items-center gap-2 text-slate-900 font-semibold mb-2">
                            <AlertTriangle size={18} className="text-orange-500" />
                            Max Reloads
                        </div>
                        <p className="text-xs text-slate-500 h-10">Maximum number of page refreshes allowed within the time window.</p>
                        <div className="relative">
                            <input
                                type="number"
                                name="maxReloads"
                                value={settings.maxReloads}
                                onChange={handleChange}
                                min="1"
                                max="100"
                                step="0.1"
                                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-lg"
                            />
                            <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">COUNT</span>
                        </div>
                    </div>

                    {/* Time Window */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                        <div className="flex items-center gap-2 text-slate-900 font-semibold mb-2">
                            <Clock size={18} className="text-blue-500" />
                            Time Window
                        </div>
                        <p className="text-xs text-slate-500 h-10">The duration in seconds to track user reloads.</p>
                        <div className="relative">
                            <input
                                type="number"
                                name="timeWindow"
                                value={settings.timeWindow}
                                onChange={handleChange}
                                min="1"
                                max="600"
                                step="0.1"
                                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-lg"
                            />
                            <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">SECONDS</span>
                        </div>
                    </div>

                    {/* Block Duration */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                        <div className="flex items-center gap-2 text-slate-900 font-semibold mb-2">
                            <ShieldAlert size={18} className="text-red-500" />
                            Block Duration
                        </div>
                        <p className="text-xs text-slate-500 h-10">How long a user is blocked from the site.</p>
                        <div className="relative">
                            <input
                                type="number"
                                name="blockDuration"
                                value={settings.blockDuration}
                                onChange={handleChange}
                                min="0.1"
                                max="1440"
                                step="0.1"
                                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-lg"
                            />
                            <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">MINUTES</span>
                        </div>
                    </div>
                </div>



                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 text-sm text-blue-700">
                    <Info className="shrink-0 mt-0.5" size={18} />
                    <p>These settings are applied globally. Changes will take effect immediately for all new user interactions. Adjusting "Block Duration" will not affect users who are currently blocked.</p>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center gap-2"
                    >
                        {saving ? <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div> : <Save size={20} />}
                        Save Configuration
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminSecurity;
