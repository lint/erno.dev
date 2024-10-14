
import React from 'react';

export default function Navbar() {

    function handleSettings() {

    }

    return (
        <div id="navbar">
            <div className="navbar-control">
                <a className="navbar-control" href="/">grissy.net</a>
            </div>
            <div className="navbar-control" onClick={handleSettings}>
                <i className="material-icons">settings</i>
            </div>
        </div>
    );
}