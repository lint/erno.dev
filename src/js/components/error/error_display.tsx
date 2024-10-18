
import React from 'react';
import './error.css';

export interface ErrorDisplayProps {
    status: string;
}

export default function ErrorDisplay({status} : ErrorDisplayProps) {

    return (
        <div id="error-container">
        <div className="text-4">
            {status}
        </div>
        <div className="text-2">
            {"Sorry, the site experienced an unexpected error."}
        </div>
    </div>
    );
}
