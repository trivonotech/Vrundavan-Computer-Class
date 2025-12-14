import React, { useState, useEffect } from 'react';
import { Save, Loader2, BarChart3 } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const AdminStats = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState(null); // { type: 'success'|'error', message: '' }
    const [stats, setStats] = useState({
        experience: '21+',
        events: '150+',
        students: '12k+',
        courses: '25+'
    });

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const docRef = doc(db, "settings", "stats");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setStats(docSnap.data());
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await setDoc(doc(db, "settings", "stats"), stats, { merge: true });
            setNotification({ type: 'success', message: 'Stats updated successfully!' });
        } catch (error) {
            console.error("Error updating stats:", error);
            setNotification({ type: 'error', message: 'Failed to update stats.' });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => setStats({ ...stats, [e.target.name]: e.target.value });

    if (loading) return <Loader2 className="animate-spin mx-auto mt-10" />;

    return (
        <div className="max-w-2xl mx-auto space-y-6 relative">
            {/* Notification Toast */}
            {notification && (
                <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 transform transition-all duration-300 z-50 animate-fade-in-up ${notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                    {notification.type === 'success' ? <Save size={20} /> : <BarChart3 size={20} />}
                    <span className="font-medium">{notification.message}</span>
                </div>
            )}

            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Homepage Statistics</h1>
                <p className="text-slate-600">Update the numbers displayed on the home page.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Years of Experience</label>
                            <input
                                name="experience"
                                value={stats.experience}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. 21+"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Events Completed</label>
                            <input
                                name="events"
                                value={stats.events}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. 150+"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Students</label>
                            <input
                                name="students"
                                value={stats.students}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. 12k+"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Courses</label>
                            <input
                                name="courses"
                                value={stats.courses}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. 25+"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Update Stats</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminStats;
