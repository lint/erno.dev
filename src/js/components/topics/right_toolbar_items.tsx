
import React from 'react';
import { Link } from 'react-router-dom';
import './topics.css';

export default function TopicDashboardRightToolbarItems() {

    return (
        <div className="toolbar-items">
            <div className="toolbar-button">
                <Link to="/topics/create">
                    <button >+ Create</button>
                </Link>
            </div>
        </div>
    );
}
