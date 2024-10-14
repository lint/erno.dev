
import React from 'react';

export interface ToolbarItems {
    left: React.ReactNode;
    right: React.ReactNode;
}

export default function Toolbar({left, right}: ToolbarItems) {
    
    return (
        <div id="toolbar">
            {left}
            {right}
        </div>
    );
}