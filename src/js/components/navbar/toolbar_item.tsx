
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './navbar.css';

export interface ToolbarItemProps {
    text: string;
    url: string;
}

export default function ToolbarItem({text, url}: ToolbarItemProps) {

    let cls = "toolbar-item";
    if (location.pathname.toLowerCase().includes(url.toLowerCase())) {
        cls += " toolbar-item-active";
    }

    return (
        <div className={cls}>
            <Link className="toolbar-item-link" to={url}>{text}</Link>
        </div>
    );
}
