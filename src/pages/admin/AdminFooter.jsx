import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const defaultData = {
    tagline: 'Empowering students with practical computer education and skills for a better future.',
    phone: '+91 98765 43210',
    email: 'info@vrundavan.com',
    address: 'Keshod, Gujarat',
    facebook: '#',
    twitter: '#',
    instagram: '#',
    linkedin: '#',
};

const inputClass = 'w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm';
const labelClass = 'block text-sm font-medium text-slate-700 mb-2';

const AdminFooter = () => {
    const [data, setData] = useState(defaultData);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        if (notification) {
            const t = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(t);
        }
    }, [notification]);

    useEffect(() => {
        const fetch = async () => {
            try {
                const snap = await getDoc(doc(db, 'settings', 'footer'));
                if (snap.exists()) setData(prev => ({ ...prev, ...snap.data() }));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const handleChange = (e) => setData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const save = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'settings', 'footer'), data, { merge: true });
            setNotification({ type: 'success', message: 'Footer saved successfully!' });
        } catch (e) {
            setNotification({ type: 'error', message: 'Failed to save.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6 relative">
            {notification && (
                <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50 ${notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    <Save size={18} /><span className="font-medium">{notification.message}</span>
                </div>
            )}

            <div className="text-center mb-4">
                <h1 className="text-2xl font-bold text-slate-900">Footer Settings</h1>
                <p className="text-slate-500 text-sm">Manage contact info and social media links</p>
            </div>

            {/* Tagline */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                <h2 className="font-bold text-slate-800">Tagline</h2>
                <div>
                    <label className={labelClass}>Description under logo</label>
                    <textarea name="tagline" value={data.tagline} onChange={handleChange} rows={3} className={inputClass} />
                </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                <h2 className="font-bold text-slate-800">Contact Info</h2>
                <div>
                    <label className={labelClass}>Phone</label>
                    <input name="phone" value={data.phone} onChange={handleChange} className={inputClass} placeholder="+91 98765 43210" />
                </div>
                <div>
                    <label className={labelClass}>Email</label>
                    <input name="email" value={data.email} onChange={handleChange} className={inputClass} placeholder="info@vrundavan.com" />
                </div>
                <div>
                    <label className={labelClass}>Address</label>
                    <input name="address" value={data.address} onChange={handleChange} className={inputClass} placeholder="Keshod, Gujarat" />
                </div>
            </div>

            {/* Social Links */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                <h2 className="font-bold text-slate-800">Social Media Links</h2>
                <p className="text-xs text-slate-400">Leave blank to hide that icon</p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Facebook URL</label>
                        <input name="facebook" value={data.facebook} onChange={handleChange} className={inputClass} placeholder="https://facebook.com/..." />
                    </div>
                    <div>
                        <label className={labelClass}>Twitter URL</label>
                        <input name="twitter" value={data.twitter} onChange={handleChange} className={inputClass} placeholder="https://twitter.com/..." />
                    </div>
                    <div>
                        <label className={labelClass}>Instagram URL</label>
                        <input name="instagram" value={data.instagram} onChange={handleChange} className={inputClass} placeholder="https://instagram.com/..." />
                    </div>
                    <div>
                        <label className={labelClass}>LinkedIn URL</label>
                        <input name="linkedin" value={data.linkedin} onChange={handleChange} className={inputClass} placeholder="https://linkedin.com/..." />
                    </div>
                </div>
            </div>

            <button onClick={save} disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-70 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Footer</>}
            </button>
        </div>
    );
};

export default AdminFooter;
