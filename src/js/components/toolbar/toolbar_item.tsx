
import React from 'react';

export interface ToolbarItemProps {
    text: string;
    url: string;
    callback: (params: any) => any;
}

export default function ToolbarItem({text, url, callback}: ToolbarItemProps) {

    let cls = "toolbar-item";
    if (url.toLowerCase() == location.pathname.toLowerCase()) {
        cls += " toolbar-item-active";
    }    

    return (
        <div className={cls}>
            <a className="unset" href={url}>
                <button className="unset" onClick={callback}>{text}</button>
            </a>
        </div>
    );
}
