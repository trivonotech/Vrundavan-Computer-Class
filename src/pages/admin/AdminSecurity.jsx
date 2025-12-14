import React, { useState, useEffect } from 'react';
import { Shield, Save, Lock, Activity, AlertTriangle, Loader2 } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const AdminSecurity = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        spamProtection: true,
        maxRequestsPerMinute: 5,
        blockDurationMinutes: 30,
        strictMode: false
    });
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const fetchSettings = async () => {
        try {
            const docRef = doc(db, "settings", "security");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setSettings(docSnap.data());
            }
        } catch (error) {
            console.error("Error fetching security settings:", error);
            setNotification({ type: 'error', message: 'Failed to load settings' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await setDoc(doc(db, "settings", "security"), settings);
            setNotification({ type: 'success', message: 'Security settings updated' });
        } catch (error) {
            console.error("Error saving settings:", error);
            setNotification({ type: 'error', message: 'Failed to save settings' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loader2 className="animate-spin mx-auto mt-10" />;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Notification */}
            {notification && (
                <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50 animate-fade-in-up text-white font-medium ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                    {notification.message}
                </div>
            )}

            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                    <Shield size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Security Center</h1>
                    <p className="text-slate-500">Manage spam protection and firewall settings.</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="grid gap-6">

                {/* Main Toggle Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${settings.spamProtection ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                <Lock size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Spam Protection</h3>
                                <p className="text-sm text-slate-500">Automatically block suspicious traffic.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.spamProtection}
                                onChange={e => setSettings({ ...settings, spamProtection: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none ring-4 ring-transparent peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>

                {/* detailed Settings */}
                <div className={`grid md:grid-cols-2 gap-6 transition-opacity ${settings.spamProtection ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-4 text-slate-800 font-semibold">
                            <Activity size={18} className="text-blue-500" />
                            Rate Limiting
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-600 block mb-2">Max Requests / Minute</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={settings.maxRequestsPerMinute}
                                    onChange={e => setSettings({ ...settings, maxRequestsPerMinute: parseInt(e.target.value) })}
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                />
                                <p className="text-xs text-slate-400 mt-2">How many times a user can submit forms per minute.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-4 text-slate-800 font-semibold">
                            <AlertTriangle size={18} className="text-amber-500" />
                            Block Duration
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-600 block mb-2">Block Time (Minutes)</label>
                                <input
                                    type="number"
                                    min="5"
                                    max="1440"
                                    value={settings.blockDurationMinutes}
                                    onChange={e => setSettings({ ...settings, blockDurationMinutes: parseInt(e.target.value) })}
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                />
                                <p className="text-xs text-slate-400 mt-2">How long a spammer remains blocked.</p>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        Save Configuration
                    </button>
                </div>

            </form>
        </div>
    );
};

export default AdminSecurity;
