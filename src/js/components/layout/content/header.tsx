import React from 'react';
import { Link } from 'react-router-dom';
import '../layout.css';

export interface ContentHeaderProps {
    text: string;
}

export default function ContentHeader({text}: ContentHeaderProps) {

    return (
        <div className="content-header">
            <div className="content-header-text">
                {text}
            </div>
        </div>
    );
}
