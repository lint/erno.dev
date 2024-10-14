
import React from 'react';

export default function TopicDashboardRightToolbarItems() {

    function handleSelectAll() {

    }

    function handleCreate() {

    }

    return (
        <div id="dashboard-right-toolbar-items" className="toolbar-items">
            <div className="toolbar-item">
                <button onClick={handleSelectAll}>Select All</button>
            </div>
            <div className="toolbar-item">
                <a href="/topics/create">
                    <button onClick={handleCreate}>+ Create</button>
                </a>
            </div>
        </div>
    );
}

export function TopicDashboardLeftToolbarItems() {

    return (
        <></>
    );
}