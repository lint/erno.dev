
import React, { useState } from 'react';
import './topics.css';
import ContentContainer from '../general/content_container';
import ContentGroup from '../general/content_group';
import { getCookie, setCookie } from '../../util/cookies';
import SegmentSelect from '../general/segment_select';

export function TopicViewPlotView() {
    return (
        <div>plot</div>
    );
}
export function TopicViewDetailsView() {
    return (
        <div>details</div>
    );
}
export function TopicViewDetailsEditView() {
    return (
        <div>details edit</div>
    );
}
export function TopicViewDataView() {
    return (
        <div>data</div>
    );
}

export interface TopicViewProps {
    topic: any;
}

export default function TopicView({ topic }: TopicViewProps) {

    let values = ["Plot", "Data", "Details"];
    let cookie_id = "topic-current-view-" + topic.topic_id;
    let topic_current_view = getCookie(cookie_id);
    let [currentView, setCurrentView] = useState(topic_current_view);

    let content;
    let activeIndex = 0;
    if (currentView === "details") {
        content = <TopicViewDetailsView />;
        activeIndex = 2;
    } else if (currentView === "details-edit") {
        content = <TopicViewDetailsEditView />;
        activeIndex = 2;
    } else if (currentView === "data") {
        content = <TopicViewDataView />
        activeIndex = 1;
    } else {
        content = <TopicViewPlotView />;
    }

    function handle_view_mode(event: React.MouseEvent<HTMLButtonElement>) {
        const button: HTMLButtonElement = event.currentTarget;
        let new_current_view = button.textContent!.toLowerCase();
        setCurrentView(new_current_view);
        setCookie(cookie_id, new_current_view, 365);
    }
    
    return (
        <ContentContainer header_text={topic.name}>
            <>
            <div id="topic-select-nav">
                <SegmentSelect 
                    controlClass="segment-select-control" 
                    activeClass="segment-select-control-active" 
                    activeIndex={activeIndex}
                    values={values}
                    callback={handle_view_mode}
                />
            </div>
            <div>
                <ContentGroup title="">
                    {content}
                </ContentGroup>
            </div>
            </>
        </ContentContainer>
    );
}
