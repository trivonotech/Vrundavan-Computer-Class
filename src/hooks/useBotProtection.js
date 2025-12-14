import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const useBotProtection = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Skip check on Access Denied page/Admin Login to prevent infinite loops
        if (location.pathname === '/access-denied' || location.pathname.startsWith('/admin')) return;

        const checkBot = async () => {
            // 1. Fetch settings (default secure)
            let settings = { botProtection: true, maxPageViewsPerMinute: 60 };
            try {
                const docRef = doc(db, "settings", "security");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    settings = { ...settings, ...docSnap.data() };
                }
            } catch (error) {
                // Fail safe: use defaults
            }

            if (!settings.botProtection) return;

            // 2. Check User Agent
            const userAgent = navigator.userAgent.toLowerCase();
            const botKeywords = ['bot', 'spider', 'crawler', 'scraper', 'headless', 'selenium', 'puppeteer'];
            if (botKeywords.some(keyword => userAgent.includes(keyword))) {
                // Allow search engine bots if needed (googlebot, bingbot), but for strict "bot protection" user asked for, we might block all suspicious ones.
                // For now, let's block obvious script bots.
                navigate('/access-denied', { replace: true });
                return;
            }

            // 3. Check Page View Rate Limit
            const now = Date.now();
            const oneMinuteAgo = now - 60000;
            const viewLog = JSON.parse(sessionStorage.getItem('page_views') || '[]');

            // Filter views from last minute
            const recentViews = viewLog.filter(time => time > oneMinuteAgo);

            if (recentViews.length >= (settings.maxPageViewsPerMinute || 60)) {
                navigate('/access-denied', { replace: true });
                return;
            }

            // Update Log
            recentViews.push(now);
            sessionStorage.setItem('page_views', JSON.stringify(recentViews));
        };

        checkBot();

    }, [location.pathname, navigate]);
};

export default useBotProtection;
