
import React, { useEffect, useState } from 'react';
import './topics.css';
import ContentContainer from '../general/content_container';
import ContentGroup from '../general/content_group';
import { getCookie, setCookie } from '../../util/cookies';
import SegmentSelect from '../general/segment_select';
import TextField from '../forms/text_field';
import SubmitCancelButtons from '../forms/submit_cancel';
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../../amplify/data/resource";
import { updateTopic } from '../../util/topics';
import ParagraphInput from '../forms/paragraph_input';

const client = generateClient<Schema>();

export interface TopicViewProps {
    topic: any;
    callback?: () => any;
    topicUpdateCallback?: (params: any) => any;
}

export function TopicViewPlotView() {
    return (
        <div>plot</div>
    );
}

export function TopicViewDetailsView({ topic, callback }: TopicViewProps) {

    const [isEditing, setIsEditing] = useState(false);

    let editButton = (
        <div id="topic-details-edit-button-container">
            <button className="common-button" onClick={() => setIsEditing(true)}>Edit</button>
        </div>
    );
    let submitCancelButtons = <SubmitCancelButtons onCancel={() => setIsEditing(false)} onSubmit={() => {

        // TODO: editing topic name needs to be validated similar to on creation

        let name = (document.getElementById("edit-form-input-title") as HTMLInputElement).value;

        if (name) {
            topic.name = name;
        }

        client.models.Topic.update(topic)
            .catch(error => {
                console.log("error: ", error);
            }).finally(() => {
                setIsEditing(false);
                if (callback) {
                    callback();
                }
            });

    }} />;
    let bottomAction = isEditing ? submitCancelButtons : editButton;

    return (
        <div className="topic-view-content">
            <div>
                <TextField title="Topic Name"
                    input_id="edit-form-input-title"
                    is_number={false}
                    is_required={false}
                    placeholder={topic.name}
                    value={topic.name}
                    size={30}
                    min_len={1}
                    max_len={256}
                    editable={isEditing}
                />
            </div>

            {bottomAction}
        </div>
    );
}

export function TopicViewDataView({ topic, topicUpdateCallback }: TopicViewProps) {

    const [isEditing, setIsEditing] = useState(false);

    let editButton = (
        <div id="topic-data-edit-button-container">
            <button className="common-button" 
                onClick={() => {
                    setIsEditing(true)
                }} 
            >
                Edit
            </button>
        </div>
    );
    let submitCancelButtons = (
        <SubmitCancelButtons 
            onCancel={() => {

                setIsEditing(false);

                let paragraphInput = document.getElementById("topic-user-data-input") as HTMLTextAreaElement;
                paragraphInput.value = paragraphInput.placeholder;

            }} 

            onSubmit={() => {

                setIsEditing(false);

                let paragraphInput = document.getElementById("topic-user-data-input") as HTMLTextAreaElement;
                
                // TODO: i don't know if this updates the topic for the parent element properly
                // also need to make the update method used in the details page the same
                // tbh can combine details and data pages...

                if (paragraphInput) {
                    paragraphInput.placeholder = paragraphInput.value;
                    
                    const topicUpdate = {
                        topic_id: topic.topic_id,
                        csvData: paragraphInput.value,
                    };
                    let updatedTopic = updateTopic(topicUpdate);
                    if (topicUpdateCallback && updatedTopic) {
                        topicUpdateCallback(updatedTopic);
                    }
                }
            }} 
        />
    );
    let bottomAction = isEditing ? submitCancelButtons : editButton;

    return (
        <div className="topic-view-content">
            <ParagraphInput title="Data" placeholder={topic.csvData} value={topic.csvData} input_id="topic-user-data-input" is_required={false} editable={isEditing} cols={40} rows={30}/>
            {bottomAction}
        </div>
    );
}

export default function TopicView({ topic, topicUpdateCallback }: TopicViewProps) {

    let values = ["Plot", "Data", "Details"];
    let cookie_id = "topic-current-view-" + topic.topic_id;
    let topic_current_view = getCookie(cookie_id);
    let [currentView, setCurrentView] = useState(topic_current_view);
    let [refresh, setRefresh] = useState(false);
    let content;
    let activeIndex = 0;
    if (currentView === "details") {
        content = <TopicViewDetailsView topic={topic} callback={() => { setRefresh(!refresh) }} />;
        activeIndex = 2;
    } else if (currentView === "data") {
        content = <TopicViewDataView topic={topic} topicUpdateCallback={topicUpdateCallback} />
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

    useEffect(() => {

    }, []);

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
