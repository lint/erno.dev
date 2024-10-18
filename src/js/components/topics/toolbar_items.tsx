
import React from 'react';
import { TopicCreateFormButton } from './create_form';
import { TopicDashboardViewModeButton } from './dashboard';
import './topics.css';

export function TopicCreateRightToolbarItems() {
    return (
        <div className="toolbar-items">
            <TopicCreateFormButton className="common-button" text="+ Create" />
        </div>
    );
}

export interface TopicDashboardRightToolbarItemsProps {
    viewModeOnClick: (params: any) => any;
    is_grid_view: boolean;
}

export default function TopicDashboardRightToolbarItems({is_grid_view, viewModeOnClick}:TopicDashboardRightToolbarItemsProps) {

    return (
        <div className="toolbar-items">
            <TopicDashboardViewModeButton is_grid_view={is_grid_view} viewModeOnClick={viewModeOnClick}/>
            <TopicCreateFormButton className="common-button" text="+ Create" />
        </div>
    );
}
