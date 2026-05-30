import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

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

const Footer = () => {
    const [data, setData] = useState(defaultData);

    useEffect(() => {
        const fetch = async () => {
            try {
                const snap = await getDoc(doc(db, 'settings', 'footer'));
                if (snap.exists()) setData(prev => ({ ...prev, ...snap.data() }));
            } catch (e) {
                console.error('Error fetching footer settings:', e);
            }
        };
        fetch();
    }, []);

    return (
        <footer className="bg-slate-900 text-white pt-12 pb-6">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-2xl font-bold mb-4">VRUNDAVAN</h3>
                        <p className="text-slate-400 text-sm">{data.tagline}</p>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-slate-400 text-sm">
                            <li><Link to="/" className="hover:text-blue-400">Home</Link></li>
                            <li><Link to="/courses" className="hover:text-blue-400">Courses</Link></li>
                            <li><Link to="/team-management" className="hover:text-blue-400">Team & Management</Link></li>
                            <li><Link to="/gallery" className="hover:text-blue-400">Gallery</Link></li>
                            <li><Link to="/contact" className="hover:text-blue-400">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
                        <ul className="space-y-2 text-slate-400 text-sm">
                            {data.phone && <li className="flex items-center gap-2"><Phone size={16} />{data.phone}</li>}
                            {data.email && <li className="flex items-center gap-2"><Mail size={16} />{data.email}</li>}
                            {data.address && <li className="flex items-center gap-2"><MapPin size={16} />{data.address}</li>}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
                        <div className="flex space-x-4">
                            {data.facebook && <a href={data.facebook} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400"><Facebook size={20} /></a>}
                            {data.twitter && <a href={data.twitter} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400"><Twitter size={20} /></a>}
                            {data.instagram && <a href={data.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400"><Instagram size={20} /></a>}
                            {data.linkedin && <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400"><Linkedin size={20} /></a>}
                        </div>
                    </div>
                </div>
                <div className="border-t border-slate-800 mt-8 pt-6 text-center text-slate-500 text-sm">
                    © {new Date().getFullYear()} Vrundavan Computers. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
