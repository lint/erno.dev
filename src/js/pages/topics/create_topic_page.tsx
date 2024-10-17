
import React from 'react';
import BasePage from '../../components/layout/base_page';
import TopicCreateForm from '../../components/topics/create_form';
import ToolbarNavItems from '../../components/navbar/toolbar_nav_items';
import TopicDashboardRightToolbarItems from '../../components/topics/right_toolbar_items';

export default function CreateTopicPage() {

    return (
        <BasePage
            left_toolbar_items={<ToolbarNavItems />}
            right_toolbar_items={<TopicDashboardRightToolbarItems />}
            page_content={<TopicCreateForm />}
        />
    );
}
