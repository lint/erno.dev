
import React from 'react';
import './forms.css';

export interface FormGroupProps {
    children: React.ReactElement;
    title: string;
}

export default function FormGroup({children, title}: FormGroupProps) {

    return (
        <div className="form-group">
            <div className="form-group-header">
                <span className="text-1d25">{title}</span>
            </div>
            <div className="form-group-content">
                {children}
            </div>
        </div>
    );
}