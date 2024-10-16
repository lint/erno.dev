
import React from 'react';

export interface ErrorDisplayProps {
    status: string;
}

export default function ErrorDisplay({status} : ErrorDisplayProps) {

    return (
        <div id="error-container">
        <div className="ultra-large-text">
            {status}
        </div>
        <div className="large-text">
            {"Sorry, the site experienced an unexpected error."}
        </div>
    </div>
    );
}