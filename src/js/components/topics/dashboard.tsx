
import React, { useState } from 'react';
import GetTopics from '../api/topic';
import { TopicCreateFormButton } from './create_form';
import './topics.css';

export function TopicDashboardListView() {
    return (
        <div>
            list
        </div>
    );
}

export function TopicDashboardGridView() {
    return (
        <div>
            grid
        </div>
    );
}

export interface TopicDashboardViewModeButtonProps {
    viewModeOnClick: (params: any) => any;
    is_grid_view: boolean;
}

export function TopicDashboardViewModeButton({viewModeOnClick, is_grid_view}: TopicDashboardViewModeButtonProps) {

    return (
        <div className="dashboard-view-mode-control">
            <div className={is_grid_view ? "dashboard-view-mode-control-active" : ""}>
                <button onClick={viewModeOnClick}>grid</button>
            </div>
            <div className="dashboard-view-mode-control-separator"></div>
            <div className={!is_grid_view ? "dashboard-view-mode-control-active" : ""}>
                <button onClick={viewModeOnClick}>list</button>
            </div>
        </div>
    );
}

export interface TopicDashboardProps {
    is_grid_view: boolean;
}

export default function TopicDashboard({ is_grid_view }: TopicDashboardProps) {

    let topics = GetTopics();
    let no_topics_comp = <div id="dashboard-empty-container">
        <div id="dashboard-empty-message">
            There are no topics yet...
        </div>
        <TopicCreateFormButton className="dashboard-empty-create-button" text="Create New Topic" />
    </div>;
    let yes_topics_comp = <div id="dashboard-content">
        {is_grid_view ? <TopicDashboardGridView /> : <TopicDashboardListView />}
    </div>;

    let content = topics.length > 0 ? yes_topics_comp : no_topics_comp;

    return (
        <div id="dashboard">
            {content}
        </div>
    );
}