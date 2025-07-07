import React, { useEffect } from 'react';

const Toaster = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => onClose(), 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-opacity duration-300
            ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
            {message}
        </div>
    );
};

export default Toaster;
