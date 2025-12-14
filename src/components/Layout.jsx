import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

import useBotProtection from '../hooks/useBotProtection';

const Layout = ({ children }) => {
    useBotProtection();
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <div className="min-h-screen flex flex-col font-sans relative">
            {/* Abstract Background Pattern - Global */}
            <div className="fixed inset-0 pointer-events-none z-[-1] bg-slate-50">
                <img
                    src="/assets/home_background_waves.png"
                    alt="Background Pattern"
                    className="w-full h-full object-cover opacity-30 animate-float-slow"
                />
            </div>
            <Navbar />
            <main className={`flex-grow ${isHome ? '' : 'pt-24'}`}>
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
