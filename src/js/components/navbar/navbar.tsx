
import React from 'react';

export default function Navbar() {

    function handleSettings() {

    }

    return (
        <div id="navbar">
            <div id="navbar-title-container">
                <a id="navbar-title" href="/">grissy.net</a>
            </div>
            <div id="navbar-settings-container">
                <div id="navbar-settings-button" className="navbar-text" onClick={handleSettings}>
                    <i id="navbar-settings-icon" className="material-icons">settings</i>
                </div>
            </div>
        </div>
    );
}