
import React from 'react';
import TopicView from '../../components/topics/topic_view';
import { TopicCreateRightToolbarItems } from '../../components/topics/create_form';
import ToolbarNavItems from '../../components/navbar/toolbar_nav_items';
import BasePage from '../base_page';
import { useParams } from 'react-router-dom';
import ErrorDisplay from '../../components/error/error_display';
import { TopicDoesExist } from '../../components/api/topic';

export default function TopicViewPage() {

    const { topic_id } = useParams();
    let content;

    if (topic_id != null && TopicDoesExist(topic_id)) {
        content = <TopicView topic_id={topic_id} />
    } else {
        content = <ErrorDisplay status="404"/>
    }

    return (
        <BasePage
            left_toolbar_items={<ToolbarNavItems />}
            right_toolbar_items={<TopicCreateRightToolbarItems />}
            page_content={content} 
        />
    );
}
