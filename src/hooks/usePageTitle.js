import { useEffect } from 'react';

const usePageTitle = (title) => {
    useEffect(() => {
        document.title = title
            ? `${title} | Vrundavan Computers`
            : 'Vrundavan Computers | Keshod';
        return () => {
            document.title = 'Vrundavan Computers | Keshod';
        };
    }, [title]);
};

export default usePageTitle;
