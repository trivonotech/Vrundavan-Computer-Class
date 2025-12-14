import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
            <h1 className="text-9xl font-bold text-slate-200">404</h1>
            <h2 className="text-3xl font-bold text-slate-800 mt-4">Page Not Found</h2>
            <p className="text-slate-600 mt-2 max-w-md">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Link
                to="/"
                className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
                Back to Home
            </Link>
        </div>
    );
};

export default NotFound;
