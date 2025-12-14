import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { X } from 'lucide-react';

const MobileMenu = ({ isOpen, onClose, items = [], socialItems = [] }) => {
    const menuRef = useRef(null);
    const overlayRef = useRef(null);
    const linksRef = useRef([]);
    const socialRef = useRef(null);
    const tl = useRef(null);

    // Initial setup
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.set(menuRef.current, { xPercent: 100 });
            gsap.set(overlayRef.current, { opacity: 0, pointerEvents: 'none' });

            tl.current = gsap.timeline({ paused: true });

            tl.current
                .to(overlayRef.current, {
                    opacity: 1,
                    pointerEvents: 'auto',
                    duration: 0.3,
                    ease: 'power2.inOut'
                })
                .to(menuRef.current, {
                    xPercent: 0,
                    duration: 0.6,
                    ease: 'power3.out'
                }, '-=0.1')
                .from(linksRef.current, {
                    y: 40,
                    opacity: 0,
                    stagger: 0.08,
                    duration: 0.5,
                    ease: 'power2.out'
                }, '-=0.3')
                .from(socialRef.current, {
                    y: 20,
                    opacity: 0,
                    duration: 0.4,
                    ease: 'power2.out'
                }, '-=0.2');
        });

        return () => ctx.revert();
    }, []);

    // Handle Open/Close
    useEffect(() => {
        if (isOpen) {
            tl.current?.timeScale(1).play();
            document.body.style.overflow = 'hidden';
        } else {
            tl.current?.timeScale(2.5).reverse(); // Speed up closing by 2.5x
            document.body.style.overflow = '';
        }
    }, [isOpen]);

    const handleLinkClick = () => {
        onClose();
    };

    return (
        <div className="md:hidden fixed inset-0 z-[9999] pointer-events-none">
            {/* Backdrop Overlay */}
            <div
                ref={overlayRef}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Menu Panel */}
            <div
                ref={menuRef}
                className="absolute top-0 right-0 h-screen min-h-screen w-[85%] max-w-md bg-white shadow-2xl flex flex-col pointer-events-auto"
            >
                {/* Header */}
                <div className="flex justify-between items-start p-8">
                    {/* Placeholder for Logo if needed, or keeping it clean */}
                    <div className="flex items-center gap-2 text-black font-semibold">
                        {/* Optional: Add Logo Here */}
                    </div>

                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 text-black font-medium hover:text-blue-600 transition-colors group"
                        aria-label="Close menu"
                    >
                        <span>Close</span>
                        <div className="bg-gray-100 p-1 rounded-full group-hover:bg-blue-100 transition-colors">
                            <X size={16} />
                        </div>
                    </button>
                </div>

                {/* Main Navigation */}
                <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-8">
                    <div className="flex flex-col gap-6">
                        {items.map((item, i) => (
                            <Link
                                key={item.label}
                                to={item.link}
                                ref={el => linksRef.current[i] = el}
                                onClick={handleLinkClick}
                                className="group relative block"
                            >
                                <div className="flex items-start">
                                    <span className="text-3xl sm:text-4xl font-black text-black tracking-tight uppercase group-hover:text-[#5227FF] transition-colors duration-300">
                                        {item.label}
                                    </span>
                                    <sup className="ml-2 text-sm font-medium text-[#5227FF] mt-2 block">
                                        {(i + 1).toString().padStart(2, '0')}
                                    </sup>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Footer / Socials */}
                <div ref={socialRef} className="p-8 sm:p-12 mt-auto">
                    <p className="text-sm text-[#5227FF] font-medium mb-4">Socials</p>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {socialItems && socialItems.map((social, i) => {
                            const Icon = social.icon;
                            return (
                                <a
                                    key={i}
                                    href={social.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-black hover:text-[#5227FF] transition-colors"
                                    aria-label={social.label}
                                >
                                    <Icon size={24} />
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileMenu;
