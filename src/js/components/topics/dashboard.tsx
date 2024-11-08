
import React from 'react';
import { TopicCreateFormButton } from './create_form';
import './topics.css';
import ContentHeader from '../general/content_header';
import { useNavigate } from 'react-router-dom';
import SegmentSelect from '../general/segment_select';
import { PageLoadingSpinner } from '../general/loading_spinner';

export interface TopicDashboardRightToolbarItemsProps {
    view_mode_callback: (params: any) => any;
    is_grid_view: boolean;
}

export function TopicDashboardRightToolbarItems({is_grid_view, view_mode_callback}:TopicDashboardRightToolbarItemsProps) {
    return (
        <div className="toolbar-items">
            <SegmentSelect 
                controlClass="segment-select-control" 
                activeClass="segment-select-control-active" 
                activeIndex={is_grid_view ? 0 : 1}
                values={["grid", "list"]}
                callback={view_mode_callback}
            />
            <TopicCreateFormButton className="common-button" text="+ Create" />
        </div>
    );
}

export interface TopicDashboardViewProps {
    topics: any[];
}

export function TopicDashboardListView({ topics }: TopicDashboardViewProps) {
    
    const navigate = useNavigate();

    return (
        <div id="dashboard-view-content">
            <div id="dashboard-list-view">
                <ul>
                    {topics.map(topic => (
                        <li key={"key-" + topic["topic_id"]} onClick={() => navigate("/topics/" + topic["topic_id"])}>
                            <span>{topic["name"]}</span>
                        </li>                        
                    ))}
                </ul>
            </div>
        </div>
    );
}

export function TopicDashboardGridView({ topics }: TopicDashboardViewProps) {

    const navigate = useNavigate();

    return (
        <div id="dashboard-view-content">
            <div id="dashboard-grid-view">
                {topics.map(topic => (
                    <div className="dashboard-grid-cell" key={"key-" + topic["name"]} onClick={() => navigate("/topics/" + topic["topic_id"])}>
                        <div className="dashboard-grid-cell-preview">

                        </div>
                        <div className="dashboard-grid-cell-title">
                            <span>{topic["name"]}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function TopicDashboardEmptyView() {   
    return (
        <div id="dashboard-error-content">
            <div id="dashboard-empty-container">
                <div id="dashboard-empty-message">
                    There are no topics yet...
                </div>
                <TopicCreateFormButton className="dashboard-empty-create-button" text="Create New Topic" />
            </div>
        </div>
    );
}

export interface TopicDashboardProps {
    is_grid_view: boolean;
    topics: any[];
    isLoading: boolean;
}

export default function TopicDashboard({ is_grid_view, topics, isLoading }: TopicDashboardProps) {

    let content;

    if (isLoading) {
        content = <PageLoadingSpinner showText={false}/>;
    } else if (topics == null || topics.length === 0) {
        content = <TopicDashboardEmptyView />;
    } else if (is_grid_view) {
        content = <TopicDashboardGridView topics={topics} />;
    } else {
        content = <TopicDashboardListView topics={topics} />;
    }

    return (
        <div id="dashboard">
            <ContentHeader text="Dashboard" />
            {content}
        </div>
    );
}
