
import React from 'react';
import TopicView from '../../components/topics/topic_view';
import { TopicCreateRightToolbarItems } from '../../components/topics/create_form';
import ToolbarNavItems from '../../components/navbar/toolbar_nav_items';
import BasePage from '../base_page';
import { useParams } from 'react-router-dom';
import ErrorDisplay from '../../components/error/error_display';
import { GetTopic } from '../../components/api/topic';

export default function TopicViewPage() {

    const { topic_id } = useParams();
    
    let content;
    let topic = topic_id != null ? GetTopic(topic_id) : null;

    if (topic != null) {
        content = <TopicView topic={topic} />
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
