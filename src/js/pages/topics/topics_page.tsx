
import React, { useState } from 'react';
import BasePage from '../../components/layout/base_page';
import TopicDashboard from '../../components/topics/dashboard';
import TopicDashboardRightToolbarItems from '../../components/topics/toolbar_items';
import ToolbarNavItems from '../../components/navbar/toolbar_nav_items';

export default function TopicsPage() {

    const [is_grid_view, set_is_grid_view] = useState(true);

    function handle_view_mode(event: React.MouseEvent<HTMLButtonElement>) {
        const button: HTMLButtonElement = event.currentTarget;
        let new_is_grid_view = button.textContent === "grid";
        set_is_grid_view(new_is_grid_view);
    }

    return (
        <BasePage
            left_toolbar_items={<ToolbarNavItems />}
            right_toolbar_items={<TopicDashboardRightToolbarItems is_grid_view={is_grid_view} viewModeOnClick={handle_view_mode}/>}
            page_content={<TopicDashboard is_grid_view={is_grid_view} />} 
        />
    );
}
