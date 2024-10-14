
import React from 'react';
import TopicDashboardToolbarItems from './toolbar_items';

export default function TopicDashboard() {

    return (
        <div id="dashboard">
            <div id="dashboard-content">
                
                <TopicDashboardToolbarItems />
                
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