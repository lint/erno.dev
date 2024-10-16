
import React from 'react';
import { Link } from 'react-router-dom';

export interface ToolbarItemProps {
    text: string;
    url: string;
    callback: (params: any) => any;
}

export default function ToolbarItem({text, url, callback}: ToolbarItemProps) {

    let cls = "toolbar-item";
    if (location.pathname.toLowerCase().includes(url.toLowerCase())) {
        cls += " toolbar-item-active";
    }    

    return (
        <div className={cls}>
            <Link className="toolbar-item-link" to={url} onClick={callback}>{text}</Link>
        </div>
    );
}
