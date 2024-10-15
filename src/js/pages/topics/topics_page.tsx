
import React from 'react';
import BasePage from '../../components/layout/base_page';
import TopicDashboard from '../../components/topics/dashboard';
import TopicDashboardRightToolbarItems from '../../components/topics/right_toolbar_items';
import ToolbarNavItems from '../../components/toolbar/nav_items';

export default function TopicsPage() {

    return (
        <BasePage
            left_toolbar_items={<ToolbarNavItems />}
            right_toolbar_items={<TopicDashboardRightToolbarItems />}
            page_content={<TopicDashboard/>} 
        />
    );
}
