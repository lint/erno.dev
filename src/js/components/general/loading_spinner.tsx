
import React from 'react';
import './general.css';

export interface LoadingSpinnerProps {
    showText: boolean;
}

export default function LoadingSpinner({ showText }: LoadingSpinnerProps) {

    let textContent = showText ? <div>Loading...</div> : <></>;

    return (
        <div className="loading-container">
           {textContent}
           <div className="loading-spinner"></div>
        </div>
    );
}

export function PageLoadingSpinner({ showText }: LoadingSpinnerProps) {

    return (
        <div className="centered-content">
            <div className="page-loading-container">
                <LoadingSpinner showText={showText} />
            </div>
        </div>
    );
}