import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();
    const action = useNavigationType();

    useEffect(() => {
        // Only scroll to top on PUSH (new page) or REPLACE (redirects).
        // On POP (back/forward/reload), let the browser restore scroll position.
        if (action !== 'POP') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [action, pathname]);

    return null;
};

export default ScrollToTop;
