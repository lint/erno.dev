
import React from 'react';
import BasePage from '../components/layout/base_page';
import TopicDashboard from '../components/topic_dashboard/dashboard';

export default function TopicsPage() {

    return (
        <BasePage 
            toolbar_items={<></>} 
            page_content={<TopicDashboard/>} 
        />
    );
}
