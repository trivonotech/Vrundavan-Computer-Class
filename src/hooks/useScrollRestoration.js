import { useEffect, useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Custom hook to manage scroll restoration with React Router v6+
 * Handles POP (back/reload) events manually to work around Suspense/Lazy loading shifts.
 */
export const useScrollRestoration = () => {
    const { pathname } = useLocation();
    const action = useNavigationType();

    // 1. Save scroll position on scroll (throttled)
    useEffect(() => {
        const handleScroll = () => {
            const key = `scroll_pos:${pathname}`;
            sessionStorage.setItem(key, window.scrollY.toString());
        };

        // Debounce/Throttle could be added here for performance, but native event loop usually handles well enough for simple storage
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [pathname]);

    // 2. Restore scroll or reset on navigation
    useLayoutEffect(() => {
        const key = `scroll_pos:${pathname}`;

        if (action === 'POP') {
            // Restore position
            const savedPos = sessionStorage.getItem(key);
            if (savedPos) {
                const y = parseInt(savedPos, 10);

                // Attempt optimized restore
                window.scrollTo(0, y);

                // Retry a few times in case of lazy loading / layout shift
                // usage of setTimeout allows the loop to check after paint
                const attempts = [50, 100, 300, 600];
                attempts.forEach(timeout => {
                    setTimeout(() => {
                        // Only force if we are currently at top (0) and shouldn't be
                        // or just force it anyway to be safe against layout shift
                        if (Math.abs(window.scrollY - y) > 50) {
                            window.scrollTo(0, y);
                        }
                    }, timeout);
                });
            }
        } else {
            // New navigation (PUSH/REPLACE) -> Scroll to top
            window.scrollTo(0, 0);
        }
    }, [action, pathname]);
};
