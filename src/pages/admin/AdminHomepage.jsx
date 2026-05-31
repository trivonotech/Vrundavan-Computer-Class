import React, { useState, useEffect, useRef } from 'react';
import { Save, Loader2, Upload, X } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

// Compress image to base64 WebP (same as AdminGallery)
const optimizeImage = (file, maxWidth = 800) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const scale = maxWidth / img.width;
                const w = img.width > maxWidth ? maxWidth : img.width;
                const h = img.width > maxWidth ? img.height * scale : img.height;
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                const dataUrl = canvas.toDataURL('image/webp', 0.75);
                if (dataUrl.length > 1000000) reject(new Error('Image too large. Please choose a smaller image.'));
                else resolve(dataUrl);
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
};

// Reusable image upload component
const ImageUploader = ({ value, onChange, aspectClass = 'h-48', label = 'Image' }) => {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        setError('');
        try {
            const dataUrl = await optimizeImage(file);
            onChange(dataUrl);
        } catch (err) {
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">{label}</label>
            {value && (
                <div className="relative inline-block">
                    <img src={value} alt="preview" className={`w-full ${aspectClass} object-cover rounded-xl border border-slate-200`} />
                    <button type="button" onClick={() => onChange('')}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                        <X size={12} />
                    </button>
                </div>
            )}
            <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            <button type="button" onClick={() => inputRef.current.click()} disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-400 text-slate-500 hover:text-blue-600 text-sm transition-colors disabled:opacity-60">
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {uploading ? 'Uploading...' : value ? 'Change Image' : 'Upload Image'}
            </button>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
};

const defaultData = {
    hero: {
        badge: 'Transforming Skills Into Success',
        heading: 'THE LEADING COMPUTER INSTITUTE IN KESHOD.',
        subheading: 'Join a new era of education where innovation meets knowledge. Discover expert-led courses, practical skills, and limitless opportunities to achieve your goals.',
        sinceText: 'SINCE 2004, VRUNDAVAN COMPUTERS IS WORKING AS COMPUTERS INSTITUTE IN KESHOD AND PROVIDE BEST KNOWLEDGE IN SOCIETY',
    },
    management: {
        heading: 'Meet Our Management',
        description: 'Our visionary leaders are dedicated to providing the best educational environment. Learn more about the minds behind Vrundavan Computers.',
        image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    missionVision: {
        mission: 'The mission of our institute is to provide all students with a high quality education that enables them to be contributing members of a multiethnic, multicultural, pluralistic society.',
        vision: 'We are a forward-thinking institute aiming to prepare our students for a rapidly changing world by equipping them with critical thinking skills, global perspective, and respect for core values.',
    },
    director: {
        name: 'Dr. Robert Fox',
        title: 'Director',
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        message: 'Dear students,\n\nCongratulations on joining the VRUNDAVAN COMPUTERS FAMILY. On behalf of the institute, I welcome you to Vrundavan Computers, a place where we celebrate youth and excellence and attempt to transform young persons into adults with a sense of social responsibility, human values and concern for environment.\n\nWe not only strive to train the students to become excellent scientists, technologists, thinkers and leaders of the society, but also help them mould themselves into better human beings.',
    },
    team: {
        heading: 'Our Expert Team',
        description: 'Our faculty comprises industry experts and passionate educators committed to your success. Get to know the people who will guide your journey.',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    contact: {
        heading: 'Get in Touch',
        description: "Have questions? We're here to help! Reach out to us for admissions, course details, or any other inquiries.",
    },
};

const inputClass = 'w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm';
const labelClass = 'block text-sm font-medium text-slate-700 mb-2';
const sectionClass = 'bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4';

const Field = ({ label, name, value, onChange, textarea, rows = 3 }) => (
    <div>
        <label className={labelClass}>{label}</label>
        {textarea ? (
            <textarea name={name} value={value} onChange={onChange} rows={rows} className={inputClass} />
        ) : (
            <input name={name} value={value} onChange={onChange} className={inputClass} />
        )}
    </div>
);

const AdminHomepage = () => {
    const [data, setData] = useState(defaultData);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState(null);
    const [activeTab, setActiveTab] = useState('hero');

    useEffect(() => {
        if (notification) {
            const t = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(t);
        }
    }, [notification]);

    useEffect(() => {
        const fetch = async () => {
            try {
                const snap = await getDoc(doc(db, 'settings', 'homepage'));
                if (snap.exists()) {
                    setData(prev => ({ ...prev, ...snap.data() }));
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const handleChange = (section, e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [section]: { ...prev[section], [name]: value } }));
    };

    const handleSave = async (section) => {
        setSaving(section);
        try {
            await setDoc(doc(db, 'settings', 'homepage'), { [section]: data[section] }, { merge: true });
            setNotification({ type: 'success', message: 'Saved successfully!' });
        } catch (e) {
            setNotification({ type: 'error', message: 'Failed to save.' });
        } finally {
            setSaving(null);
        }
    };

    const tabs = [
        { key: 'hero', label: 'Hero' },
        { key: 'management', label: 'Management' },
        { key: 'missionVision', label: 'Mission & Vision' },
        { key: 'director', label: "Director's Message" },
        { key: 'team', label: 'Team' },
        { key: 'contact', label: 'Contact' },
    ];

    if (loading) return <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6 relative">
            {notification && (
                <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50 animate-fade-in-up ${notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    <Save size={18} />
                    <span className="font-medium">{notification.message}</span>
                </div>
            )}

            <div className="text-center mb-4">
                <h1 className="text-2xl font-bold text-slate-900">Homepage Content</h1>
                <p className="text-slate-500 text-sm">Edit all home page sections from here</p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
                {tabs.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === t.key ? 'bg-blue-600 text-white shadow' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-400'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Hero */}
            {activeTab === 'hero' && (
                <div className={sectionClass}>
                    <h2 className="font-bold text-slate-800">Hero Section</h2>
                    <Field label="Badge Text" name="badge" value={data.hero.badge} onChange={e => handleChange('hero', e)} />
                    <Field label="Main Heading" name="heading" value={data.hero.heading} onChange={e => handleChange('hero', e)} textarea rows={2} />
                    <Field label="Subheading" name="subheading" value={data.hero.subheading} onChange={e => handleChange('hero', e)} textarea rows={3} />
                    <Field label="Since Text (bottom banner)" name="sinceText" value={data.hero.sinceText} onChange={e => handleChange('hero', e)} textarea rows={2} />
                    <SaveBtn onClick={() => handleSave('hero')} saving={saving === 'hero'} />
                </div>
            )}

            {/* Management */}
            {activeTab === 'management' && (
                <div className={sectionClass}>
                    <h2 className="font-bold text-slate-800">Management Preview Section</h2>
                    <Field label="Heading" name="heading" value={data.management.heading} onChange={e => handleChange('management', e)} />
                    <Field label="Description" name="description" value={data.management.description} onChange={e => handleChange('management', e)} textarea rows={3} />
                    <ImageUploader
                        label="Section Image"
                        value={data.management.image}
                        onChange={val => setData(prev => ({ ...prev, management: { ...prev.management, image: val } }))}
                        aspectClass="h-48"
                    />
                    <SaveBtn onClick={() => handleSave('management')} saving={saving === 'management'} />
                </div>
            )}

            {/* Mission & Vision */}
            {activeTab === 'missionVision' && (
                <div className={sectionClass}>
                    <h2 className="font-bold text-slate-800">Mission & Vision</h2>
                    <Field label="Our Mission" name="mission" value={data.missionVision.mission} onChange={e => handleChange('missionVision', e)} textarea rows={5} />
                    <Field label="Our Vision" name="vision" value={data.missionVision.vision} onChange={e => handleChange('missionVision', e)} textarea rows={5} />
                    <SaveBtn onClick={() => handleSave('missionVision')} saving={saving === 'missionVision'} />
                </div>
            )}

            {/* Director */}
            {activeTab === 'director' && (
                <div className={sectionClass}>
                    <h2 className="font-bold text-slate-800">Director's Message</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Director Name" name="name" value={data.director.name} onChange={e => handleChange('director', e)} />
                        <Field label="Title / Designation" name="title" value={data.director.title} onChange={e => handleChange('director', e)} />
                    </div>
                    <ImageUploader
                        label="Director Photo"
                        value={data.director.image}
                        onChange={val => setData(prev => ({ ...prev, director: { ...prev.director, image: val } }))}
                        aspectClass="h-36 w-32"
                    />
                    <Field label="Message" name="message" value={data.director.message} onChange={e => handleChange('director', e)} textarea rows={8} />
                    <SaveBtn onClick={() => handleSave('director')} saving={saving === 'director'} />
                </div>
            )}

            {/* Team */}
            {activeTab === 'team' && (
                <div className={sectionClass}>
                    <h2 className="font-bold text-slate-800">Team Preview Section</h2>
                    <Field label="Heading" name="heading" value={data.team.heading} onChange={e => handleChange('team', e)} />
                    <Field label="Description" name="description" value={data.team.description} onChange={e => handleChange('team', e)} textarea rows={3} />
                    <ImageUploader
                        label="Section Image"
                        value={data.team.image}
                        onChange={val => setData(prev => ({ ...prev, team: { ...prev.team, image: val } }))}
                        aspectClass="h-48"
                    />
                    <SaveBtn onClick={() => handleSave('team')} saving={saving === 'team'} />
                </div>
            )}

            {/* Contact */}
            {activeTab === 'contact' && (
                <div className={sectionClass}>
                    <h2 className="font-bold text-slate-800">Contact Preview Section</h2>
                    <Field label="Heading" name="heading" value={data.contact.heading} onChange={e => handleChange('contact', e)} />
                    <Field label="Description" name="description" value={data.contact.description} onChange={e => handleChange('contact', e)} textarea rows={3} />
                    <SaveBtn onClick={() => handleSave('contact')} saving={saving === 'contact'} />
                </div>
            )}
        </div>
    );
};

const SaveBtn = ({ onClick, saving }) => (
    <button
        onClick={onClick}
        disabled={saving}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-70 flex items-center justify-center gap-2"
    >
        {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Changes</>}
    </button>
);

export default AdminHomepage;
