
import React from 'react';
import ParentProps from '../interfaces/parent_props';

export default function Toolbar({children}: ParentProps) {
    
    return (
        <div id="toolbar">
            {children}
        </div>
    );
}