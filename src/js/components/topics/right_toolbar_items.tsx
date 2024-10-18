
import React from 'react';
import { Link } from 'react-router-dom';
import { setCookie, getCookie } from '../../util/cookies';
import './topics.css';

export default function TopicDashboardRightToolbarItems() {

    function handle_create() {
        if (location.pathname !== "/topics/create") {
            setCookie("create-topic-url-ref", location.pathname, 0);
        }
    }

    return (
        <div className="toolbar-items">
            <div>
                <Link className="unset" to="/topics/create">
                    <button className="common-button" onClick={handle_create}>+ Create</button>
                </Link>
            </div>
        </div>
    );
}
