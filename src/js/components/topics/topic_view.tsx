
import React from 'react';
import './topics.css';

export interface TopicViewProps {
    topic_id: string;
}

export default function TopicView({ topic_id }: TopicViewProps) {

    return (
        <div>
            {topic_id}
        </div>
    );
}
