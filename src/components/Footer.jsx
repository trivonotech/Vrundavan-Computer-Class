import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-white pt-12 pb-6">
            <div className="max-w-screen-xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-2xl font-bold mb-4">SKILLNEST</h3>
                        <p className="text-slate-400 text-sm">
                            Shaping minds and building futures through smarter learning. Join us to achieve your goals.
                        </p>
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
                            <li className="flex items-center gap-2"><Phone size={16} /> +1 234 567 890</li>
                            <li className="flex items-center gap-2"><Mail size={16} /> info@skillnest.com</li>
                            <li className="flex items-center gap-2"><MapPin size={16} /> 123 Education St, Knowledge City</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
                        <div className="flex space-x-4">
                            <a href="#" className="text-slate-400 hover:text-blue-400"><Facebook size={20} /></a>
                            <a href="#" className="text-slate-400 hover:text-blue-400"><Twitter size={20} /></a>
                            <a href="#" className="text-slate-400 hover:text-blue-400"><Instagram size={20} /></a>
                            <a href="#" className="text-slate-400 hover:text-blue-400"><Linkedin size={20} /></a>
                        </div>
                    </div>
                </div>
                <div className="border-t border-slate-800 mt-8 pt-6 text-center text-slate-500 text-sm">
                    © {new Date().getFullYear()} SkillNest. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
