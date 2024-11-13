
import React, { useEffect, useState } from 'react';
import './topics.css';
import ContentContainer from '../general/content_container';
import ContentGroup from '../general/content_group';
import { getCookie, setCookie } from '../../util/cookies';
import SegmentSelect from '../general/segment_select';
import TextField from '../forms/text_field';
import SubmitCancelButtons from '../forms/submit_cancel';
import { updateTopic } from '../../util/topics';
import ParagraphInput from '../forms/paragraph_input';
import Papa from 'papaparse';
import * as Plot from '@observablehq/plot';

export interface TopicViewProps {
    topic: any;
    callback?: () => any;
    topicUpdateCallback?: (params: any) => any;
}

export function TopicViewPlotView({ topic }: TopicViewProps) {

    let parsedData = Papa.parse(topic.csvData, {
        header: true,
        dynamicTyping: true
    });

    console.log("csvData: ", parsedData);

    useEffect(() => {
        // TODO: there is definitely a better way to load the plot component. can't seem to find a good way to convert the results of Plot.plot() to be usable by react

        let plot = Plot.plot({
            marks: [
                Plot.dot(parsedData.data, { x: "test1", y: "test2" })
            ]
        });

        let plotContainer = document.getElementById("topic-plot");
        if (plotContainer) {
            plotContainer.innerHTML = "";
            plotContainer.appendChild(plot);
        }

    }, []);

    return (
        <div className="topic-view-content">
            <div id="topic-plot-container">
                <div id="topic-plot"></div>
            
            </div>
        </div>
    );
}

export function TopicViewDetailsView({ topic, topicUpdateCallback }: TopicViewProps) {

    const [isEditing, setIsEditing] = useState(false);

    let editButton = (
        <div id="topic-details-edit-button-container">
            <button className="common-button" onClick={() => setIsEditing(true)}>Edit</button>
        </div>
    );
    let submitCancelButtons = <SubmitCancelButtons onCancel={() => setIsEditing(false)} onSubmit={() => {

        // TODO: editing topic name needs to be validated similar to on creation

        let name = (document.getElementById("edit-form-input-title") as HTMLInputElement).value;
        if (!name) {
            return;
        }

        const updatedContents = {
            topic_id: topic.topic_id,
            name: name,
        };
        updateTopic(updatedContents, topicUpdateCallback, () => {setIsEditing(false);});

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

    // TODO: needs to be a difference between when the submit request has started / finished
    // basically showing that the request is loading
    // currently the text instantly changes color and there is no indication that the request actually went through
    // could either do a loading spinner on the page, loading cursor, or just different colors of text

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
                    
                    const updatedContents = {
                        topic_id: topic.topic_id,
                        csvData: paragraphInput.value,
                    };
                    updateTopic(updatedContents, topicUpdateCallback, () => {setIsEditing(false);});
                }
            }} 
        />
    );
    let bottomAction = isEditing ? submitCancelButtons : editButton;

    return (
        <div className="topic-view-content">
            <ParagraphInput title="Data" placeholder={topic.csvData} value={topic.csvData} input_id="topic-user-data-input" is_required={false} editable={isEditing} cols={40} rows={30} />
            {bottomAction}
        </div>
    );
}

export default function TopicView({ topic, topicUpdateCallback }: TopicViewProps) {

    let values = ["Plot", "Data", "Details"];
    let cookie_id = "topic-current-view-" + topic.topic_id;
    let topic_current_view = getCookie(cookie_id);
    let [currentView, setCurrentView] = useState(topic_current_view);
    // let [refresh, setRefresh] = useState(false);
    let content;
    let activeIndex = 0;

    // console.log("TopicView topic:", topic);

    if (currentView === "details") {
        content = <TopicViewDetailsView topic={topic} topicUpdateCallback={topicUpdateCallback} />;
        activeIndex = 2;
    } else if (currentView === "data") {
        content = <TopicViewDataView topic={topic} topicUpdateCallback={topicUpdateCallback} />
        activeIndex = 1;
    } else {
        content = <TopicViewPlotView topic={topic} topicUpdateCallback={topicUpdateCallback} />;
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
