
import React from 'react';
import BasePage from '../base_page';
import TopicCreateForm from '../../components/topics/create_form';
import ToolbarNavItems from '../../components/navbar/toolbar_nav_items';
import { TopicCreateRightToolbarItems } from '../../components/topics/create_form';

export default function TopicCreatePage() {

    return (
        <BasePage
            left_toolbar_items={<ToolbarNavItems />}
            right_toolbar_items={<TopicCreateRightToolbarItems />}
            page_content={<TopicCreateForm />}
        />
    );
}
