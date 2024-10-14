
import React from 'react';
import BasePage from '../components/layout/base_page';
import CreateTopicForm from '../components/topic_dashboard/create';
import TopicDashboard from '../components/topic_dashboard/dashboard';

export default function CreateTopicPage() {

    return (
        <BasePage>
            <CreateTopicForm />
        </BasePage>
    );
}
