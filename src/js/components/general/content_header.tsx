
import React from 'react';
import './general.css';

export interface ContentHeaderProps {
    text: string;
}

export default function ContentHeader({text}: ContentHeaderProps) {

    return (
        <div className="content-header">
            <div className="content-header-text text-1d25">
                {text}
            </div>
        </div>
    );
}
