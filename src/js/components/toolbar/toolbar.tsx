
import React from 'react';

export interface ToolbarItems {
    items: React.ReactNode;
}

export default function Toolbar({items}: ToolbarItems) {
    
    return (
        <div id="toolbar">
            {items}
        </div>
    );
}