
import React from 'react';
import './general.css';

export interface ContentGroupProps {
    children: React.ReactElement;
    title: string;
}

export default function ContentGroup({children, title}: ContentGroupProps) {

    return (
        <div className="content-group">
            <div className="content-group-header">
                <span>{title}</span>
            </div>
            <div className="content-group-content">
                {children}
            </div>
        </div>
    );
}
