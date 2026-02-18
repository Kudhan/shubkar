import React from 'react';
import { Loader2 } from 'lucide-react';

const Spinner = ({ size = 20, className = '', color = 'text-current' }) => {
    return (
        <Loader2
            size={size}
            className={`animate-spin ${color} ${className}`}
        />
    );
};

export default Spinner;
