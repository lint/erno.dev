
import React, { useEffect, useState } from 'react';
import TopicView from '../../components/topics/topic_view';
import { TopicCreateRightToolbarItems } from '../../components/topics/create_form';
import ToolbarNavItems from '../../components/navbar/toolbar_nav_items';
import BasePage from '../base_page';
import { useParams } from 'react-router-dom';
import ErrorDisplay from '../../components/error/error_display';
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../../amplify/data/resource";
import { PageLoadingSpinner } from '../../components/general/loading_spinner';

const client = generateClient<Schema>();

export interface TopicViewPageState {
    topic?: any;
    isLoading: boolean;
}

export default function TopicViewPage() {
    
    const { topic_id } = useParams();

    const getTopic = async () => {

        if (topic_id == null) {
            return;
        }

        const {data, errors} = await client.models.Topic.get({topic_id: topic_id});

        if (errors != null) {
            console.log("Errors ", errors);
            return;
        }
        setState({ topic: data, isLoading:false } as TopicViewPageState);
    }

    function topicUpdateCallback(topic: any) {
        setState({ topic: topic, isLoading:false } as TopicViewPageState);
    }

    useEffect(() => { 
        getTopic();
    }, []);
    const [state, setState] = useState({ isLoading:true } as TopicViewPageState);

    let content;
    if (state != null && state.topic != null) {
        content = <TopicView topic={state.topic} topicUpdateCallback={topicUpdateCallback}/>
    } else if (state.isLoading) {
        content = <PageLoadingSpinner showText={false} />
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
