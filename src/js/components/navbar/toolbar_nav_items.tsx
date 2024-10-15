
import React from 'react';
import ToolbarItem from './toolbar_item';


export default function ToolbarNavItems() {

    return (
        <div className="toolbar-items">
            <ToolbarItem text="Topics" url="/topics" callback={()=>{}} />
            <ToolbarItem text="Test" url="/test" callback={()=>{}} />
        </div>
    );
}