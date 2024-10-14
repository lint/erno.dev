
import React from 'react';
// import Create from './create';

export default function TopicDashboardToolbarItems() {

    function handleSelectAll() {

    }

    function handleCreate() {

    }

    return (
        <div id="dashboard-toolbar-items">
            <div id="select-all-button-container" className="dashboard-toolbar-item">
                <button id="select-all-button" onClick={handleSelectAll}>Select All</button>
            </div>
            <div id="create-button-container" className="dashboard-toolbar-item">
                <a href="/topics/create">
                    <button id="create-button" onClick={handleCreate}>+ Create</button>
                </a>
            </div>
        </div>
    );
}