import React, { useState, useEffect } from 'react';
import { Save, Loader2, Plus, Trash2, Phone } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const defaultData = {
    header: {
        title: 'Get in Touch',
        description: 'We have convenient centers to serve you. Visit the one nearest to you or send us a message online.',
    },
    offices: [
        {
            id: 'keshod',
            name: 'Keshod Office',
            address: 'Amrutnagar Main Road, Keshod',
            mapUrl: '',
            phone: ['+91 98765 43210'],
            email: 'keshod@vrundavancomputers.com',
        },
    ],
    hours: [
        { day: 'Monday - Friday', time: '9:30 AM - 6:30 PM' },
        { day: 'Saturday', time: '10:00 AM - 2:00 PM' },
        { day: 'Sunday', time: 'Closed' },
    ],
    faqs: [
        { question: 'Which center should I visit?', answer: 'You can visit any center that is convenient for you.' },
    ],
};

const inputClass = 'w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm';
const labelClass = 'block text-xs font-medium text-slate-500 mb-1';

const AdminContact = () => {
    const [data, setData] = useState(defaultData);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState(null);
    const [activeTab, setActiveTab] = useState('offices');

    useEffect(() => {
        if (notification) {
            const t = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(t);
        }
    }, [notification]);

    useEffect(() => {
        const fetch = async () => {
            try {
                const snap = await getDoc(doc(db, 'settings', 'contact'));
                if (snap.exists()) setData(prev => ({ ...prev, ...snap.data() }));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const save = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'settings', 'contact'), data, { merge: true });
            setNotification({ type: 'success', message: 'Saved successfully!' });
        } catch (e) {
            setNotification({ type: 'error', message: 'Failed to save.' });
        } finally {
            setSaving(false);
        }
    };

    // Office handlers
    const addOffice = () => setData(prev => ({
        ...prev,
        offices: [...prev.offices, { id: Date.now().toString(), name: '', address: '', mapUrl: '', phone: [''], email: '' }]
    }));

    const removeOffice = (i) => setData(prev => ({ ...prev, offices: prev.offices.filter((_, idx) => idx !== i) }));

    const updateOffice = (i, field, value) => setData(prev => {
        const offices = [...prev.offices];
        offices[i] = { ...offices[i], [field]: value };
        return { ...prev, offices };
    });

    const addPhone = (i) => setData(prev => {
        const offices = [...prev.offices];
        offices[i] = { ...offices[i], phone: [...(offices[i].phone || []), ''] };
        return { ...prev, offices };
    });

    const updatePhone = (officeIdx, phoneIdx, value) => setData(prev => {
        const offices = [...prev.offices];
        const phone = [...offices[officeIdx].phone];
        phone[phoneIdx] = value;
        offices[officeIdx] = { ...offices[officeIdx], phone };
        return { ...prev, offices };
    });

    const removePhone = (officeIdx, phoneIdx) => setData(prev => {
        const offices = [...prev.offices];
        offices[officeIdx] = { ...offices[officeIdx], phone: offices[officeIdx].phone.filter((_, i) => i !== phoneIdx) };
        return { ...prev, offices };
    });

    // Hours handlers
    const updateHour = (i, field, value) => setData(prev => {
        const hours = [...prev.hours];
        hours[i] = { ...hours[i], [field]: value };
        return { ...prev, hours };
    });
    const addHour = () => setData(prev => ({ ...prev, hours: [...prev.hours, { day: '', time: '' }] }));
    const removeHour = (i) => setData(prev => ({ ...prev, hours: prev.hours.filter((_, idx) => idx !== i) }));

    // FAQ handlers
    const updateFaq = (i, field, value) => setData(prev => {
        const faqs = [...prev.faqs];
        faqs[i] = { ...faqs[i], [field]: value };
        return { ...prev, faqs };
    });
    const addFaq = () => setData(prev => ({ ...prev, faqs: [...prev.faqs, { question: '', answer: '' }] }));
    const removeFaq = (i) => setData(prev => ({ ...prev, faqs: prev.faqs.filter((_, idx) => idx !== i) }));

    const tabs = [
        { key: 'offices', label: 'Locations' },
        { key: 'hours', label: 'Office Hours' },
        { key: 'faqs', label: 'FAQs' },
        { key: 'header', label: 'Header Text' },
    ];

    if (loading) return <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6 relative">
            {notification && (
                <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50 ${notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    <Save size={18} /><span className="font-medium">{notification.message}</span>
                </div>
            )}

            <div className="text-center mb-4">
                <h1 className="text-2xl font-bold text-slate-900">Contact Page Settings</h1>
                <p className="text-slate-500 text-sm">Manage locations, hours and FAQs</p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === t.key ? 'bg-blue-600 text-white shadow' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-400'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Locations */}
            {activeTab === 'offices' && (
                <div className="space-y-4">
                    {data.offices.map((office, i) => (
                        <div key={office.id || i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-800">Location {i + 1}</span>
                                <button onClick={() => removeOffice(i)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Office Name</label>
                                    <input value={office.name} onChange={e => updateOffice(i, 'name', e.target.value)} className={inputClass} placeholder="e.g. Keshod Office" />
                                </div>
                                <div>
                                    <label className={labelClass}>Email</label>
                                    <input value={office.email} onChange={e => updateOffice(i, 'email', e.target.value)} className={inputClass} placeholder="office@example.com" />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Address</label>
                                <input value={office.address} onChange={e => updateOffice(i, 'address', e.target.value)} className={inputClass} placeholder="Full address" />
                            </div>
                            <div>
                                <label className={labelClass}>Google Maps Embed URL</label>
                                <input value={office.mapUrl} onChange={e => updateOffice(i, 'mapUrl', e.target.value)} className={inputClass} placeholder="https://www.google.com/maps/embed?pb=..." />
                                <p className="text-xs text-slate-400 mt-1">Google Maps → Share → Embed a map → copy the src URL</p>
                            </div>
                            <div>
                                <label className={labelClass}>Phone Numbers</label>
                                <div className="space-y-2">
                                    {(office.phone || []).map((ph, pi) => (
                                        <div key={pi} className="flex gap-2">
                                            <input value={ph} onChange={e => updatePhone(i, pi, e.target.value)} className={inputClass} placeholder="+91 98765 43210" />
                                            <button onClick={() => removePhone(i, pi)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => addPhone(i)} className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:text-blue-700">
                                        <Plus size={14} /> Add Phone
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button onClick={addOffice} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                        <Plus size={16} /> Add Location
                    </button>
                    <SaveBtn onClick={save} saving={saving} />
                </div>
            )}

            {/* Office Hours */}
            {activeTab === 'hours' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <h2 className="font-bold text-slate-800">Office Hours</h2>
                    {data.hours.map((h, i) => (
                        <div key={i} className="flex gap-3 items-center">
                            <input value={h.day} onChange={e => updateHour(i, 'day', e.target.value)} className={inputClass} placeholder="e.g. Monday - Friday" />
                            <input value={h.time} onChange={e => updateHour(i, 'time', e.target.value)} className={inputClass} placeholder="e.g. 9:30 AM - 6:30 PM" />
                            <button onClick={() => removeHour(i)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg shrink-0"><Trash2 size={15} /></button>
                        </div>
                    ))}
                    <button onClick={addHour} className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-700">
                        <Plus size={15} /> Add Row
                    </button>
                    <SaveBtn onClick={save} saving={saving} />
                </div>
            )}

            {/* FAQs */}
            {activeTab === 'faqs' && (
                <div className="space-y-4">
                    {data.faqs.map((faq, i) => (
                        <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-700">FAQ {i + 1}</span>
                                <button onClick={() => removeFaq(i)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
                            </div>
                            <div>
                                <label className={labelClass}>Question</label>
                                <input value={faq.question} onChange={e => updateFaq(i, 'question', e.target.value)} className={inputClass} placeholder="Question..." />
                            </div>
                            <div>
                                <label className={labelClass}>Answer</label>
                                <textarea value={faq.answer} onChange={e => updateFaq(i, 'answer', e.target.value)} rows={3} className={inputClass} placeholder="Answer..." />
                            </div>
                        </div>
                    ))}
                    <button onClick={addFaq} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                        <Plus size={16} /> Add FAQ
                    </button>
                    <SaveBtn onClick={save} saving={saving} />
                </div>
            )}

            {/* Header */}
            {activeTab === 'header' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <h2 className="font-bold text-slate-800">Page Header</h2>
                    <div>
                        <label className={labelClass}>Title</label>
                        <input value={data.header.title} onChange={e => setData(prev => ({ ...prev, header: { ...prev.header, title: e.target.value } }))} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Description</label>
                        <textarea value={data.header.description} onChange={e => setData(prev => ({ ...prev, header: { ...prev.header, description: e.target.value } }))} rows={3} className={inputClass} />
                    </div>
                    <SaveBtn onClick={save} saving={saving} />
                </div>
            )}
        </div>
    );
};

const SaveBtn = ({ onClick, saving }) => (
    <button onClick={onClick} disabled={saving}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-70 flex items-center justify-center gap-2">
        {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Changes</>}
    </button>
);

export default AdminContact;
