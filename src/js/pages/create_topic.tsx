
import React from 'react';
import BasePage from '../components/layout/base_page';
import CreateTopicForm from '../components/topic_dashboard/create';

export default function CreateTopicPage() {

    return (
        <BasePage
            left_toolbar_items={<></>}
            right_toolbar_items={<></>}
            page_content={<CreateTopicForm />}
        />
    );
}
