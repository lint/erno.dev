
import React from 'react';

export interface NavbarItems {
    left: React.ReactNode;
    right: React.ReactNode;
}

export default function Navbar({left, right}: NavbarItems) {

    function handleSettings() {

    }

    return (
        <div id="page-header">
            
            <div id="navbar">
                <div className="navbar-control">
                    <a className="navbar-control" href="/">grissy.net</a>
                </div>
                <div className="navbar-control" onClick={handleSettings}>
                    <i className="material-icons">settings</i>
                </div>
            </div>

            <div id="toolbar">
                {left}
                {right}
            </div>
        </div>
    );
}
