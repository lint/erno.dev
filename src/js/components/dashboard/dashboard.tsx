
import React from 'react';
import Toolbar from './toolbar.tsx';

export default function Dashboard() {

    return (
        <div id="dashboard">
            <div id="dashboard-content">
                
                <Toolbar />
                
                <div id="dashboard-view">
                    <div id="dashboard-list-container">
                        <ul id="dashboard-list">
                            <li className="dashboard-list-item">test</li>
                        </ul>
                    </div>
                    <div id="dashboard-grid-container">
                        
                    </div>
        
                </div>
            </div>

        </div>
    );
}