
import React from 'react';

export interface ToolbarItemProps {
    text: string;
    url: string;
    callback: (params: any) => any;
}

export default function ToolbarItem({text, url, callback}: ToolbarItemProps) {

    return (
        <div className="toolbar-item">
            <a className="unset" href={url}>
                <button className="unset" onClick={callback}>{text}</button>
            </a>
        </div>
    );
}