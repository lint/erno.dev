
import React from 'react';
import { Link } from 'react-router-dom';
import './navbar.css';

export interface NavbarItems {
    left: React.ReactNode;
    right: React.ReactNode;
}

export default function Navbar({left, right}: NavbarItems) {

    return (
        <div id="page-header">
            
            <div id="navbar">
                <div>
                    <Link className="navbar-control" to="/">grissy.net</Link>
                </div>
                <div>
                    <Link className="navbar-control" to="/settings">
                        <i className="material-icons">settings</i>
                    </Link>
                </div>
            </div>

            <div id="toolbar">
                {left}
                {right}
            </div>
        </div>
    );
}
