
import React from 'react';
import { Link } from 'react-router-dom';

export default function TopicDashboardRightToolbarItems() {

    function handleSelectAll() {

    }

    function handleCreate() {

    }

    return (
        <div className="toolbar-items">
            <div className="toolbar-button">
                <button onClick={handleSelectAll}>Select All</button>
            </div>
            <div className="toolbar-button">
                <Link to="/topics/create">
                    <button onClick={handleCreate}>+ Create</button>
                </Link>
            </div>
        </div>
    );
}

export function TopicDashboardLeftToolbarItems() {

    return (
        <></>
    );
}