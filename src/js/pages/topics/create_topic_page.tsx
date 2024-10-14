
import React from 'react';
import BasePage from '../../components/layout/base_page';
import TopicCreateForm from '../../components/topics/create_form';

export default function CreateTopicPage() {

    return (
        <BasePage
            left_toolbar_items={<></>}
            right_toolbar_items={<></>}
            page_content={<TopicCreateForm />}
        />
    );
}
