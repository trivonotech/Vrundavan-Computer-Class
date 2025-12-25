import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Twitter, Instagram, Linkedin, Menu, Facebook, Youtube, MessageCircle } from 'lucide-react';
import MobileMenu from './MobileMenu';


const Navbar = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = [
        { label: 'Home', link: '/', ariaLabel: 'Go to home page' },
        { label: 'Courses', link: '/courses', ariaLabel: 'View courses' },
        { label: 'Team & Management', link: '/team-management', ariaLabel: 'Meet our team and management' },
        { label: 'Gallery', link: '/gallery', ariaLabel: 'View gallery' },
        { label: 'Contact', link: '/contact', ariaLabel: 'Contact us' },
    ];

    const socialItems = [
        { label: 'WhatsApp', link: 'https://whatsapp.com', icon: MessageCircle },
        { label: 'Facebook', link: 'https://facebook.com', icon: Facebook },
        { label: 'LinkedIn', link: 'https://linkedin.com', icon: Linkedin },
        { label: 'YouTube', link: 'https://youtube.com', icon: Youtube },
        { label: 'Instagram', link: 'https://instagram.com', icon: Instagram }
    ];

    const isActive = (path) => location.pathname === path;

    const handleLinkClick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <nav className="fixed w-full z-50 top-0 start-0 border-b border-white/20 bg-white/10 backdrop-blur-md shadow-sm">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse z-50 relative" onClick={handleLinkClick}>
                    <img src="/assets/logo.png" alt="SKILLNEST" className="h-12 w-auto object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]" />
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
                    <Link to="/contact" onClick={handleLinkClick} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm px-6 py-2 text-center backdrop-blur-sm bg-opacity-80 border border-white/30">
                        Register Now ↗
                    </Link>
                </div>
                <div className="hidden md:flex items-center justify-between w-full md:w-auto md:order-1" id="navbar-sticky">
                    <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent">
                        {navLinks.map((link) => (
                            <li key={link.label}>
                                <Link
                                    to={link.link}
                                    onClick={handleLinkClick}
                                    className={`block py-2 px-3 rounded md:p-0 ${isActive(link.link)
                                        ? 'text-blue-700 bg-blue-50 md:bg-transparent md:text-blue-700'
                                        : 'text-slate-700 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700'
                                        }`}
                                    aria-current={isActive(link.link) ? 'page' : undefined}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>


                {/* Mobile Menu Toggle Button */}
                <div className="md:hidden flex items-center">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="text-slate-800 p-2 focus:outline-none"
                        aria-label="Open menu"
                    >
                        <Menu size={28} />
                    </button>
                </div>

                {/* Mobile Menu Component */}
                <MobileMenu
                    isOpen={isMobileMenuOpen}
                    onClose={() => setIsMobileMenuOpen(false)}
                    items={navLinks}
                    socialItems={socialItems}
                />

            </div>
        </nav>
    );
};

export default Navbar;
