
import React, { useState } from 'react';
import './topics.css';
import ContentContainer from '../general/content_container';
import ContentGroup from '../general/content_group';
import { getCookie, setCookie } from '../../util/cookies';
import SegmentSelect from '../general/segment_select';
import TextField from '../forms/text_field';
import SubmitCancelButtons from '../forms/submit_cancel';
import UserDataGridInput from './user_data_input';
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../../amplify/data/resource";
import createRatingsGridForTopic, { createUserListForTopic } from '../../util/topics';

const client = generateClient<Schema>();

export interface TopicViewProps {
    topic: any;
}

export interface TopicViewCallbackProps {
    topic: any;
    callback: () => any;
}

export function TopicViewPlotView() {
    return (
        <div>plot</div>
    );
}

export function TopicViewDetailsView({topic, callback}: TopicViewCallbackProps) {
    console.log(topic)

    const [isEditing, setIsEditing] = useState(false);

    let editButton = (
        <div id="topic-details-edit-button-container">
            <button className="common-button" onClick={() => setIsEditing(true)}>Edit</button>
        </div>
    );
    let submitCancelButtons = <SubmitCancelButtons onCancel={() => setIsEditing(false)} onSubmit={()=>{

        let name = (document.getElementById("edit-form-input-title") as HTMLInputElement).value;
        let inputNumUsers =  (document.getElementById("edit-form-input-num-users") as HTMLInputElement).value;
        let inputNumEntries = (document.getElementById("edit-form-input-num-entries") as HTMLInputElement).value;
        let inputNumSubjects = (document.getElementById("edit-form-input-num-subjects") as HTMLInputElement).value;

        if (name) {
            topic.name = name;
        }
        if (inputNumUsers) {
            topic.input_num_users = inputNumUsers;
        }
        if (inputNumEntries) {
            topic.input_num_entries = inputNumEntries;
        }
        if (inputNumSubjects) {
            topic.input_num_subjects = inputNumSubjects;
        }

        console.log(topic);
        client.models.Topic.update(topic)
        .catch(error => {
            console.log("error: ", error);
        }).finally(() => {
            setIsEditing(false);
            callback();
        });

    }}/>;
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
                <TextField title="Users" 
                    input_id="edit-form-input-num-users" 
                    is_number={true} 
                    is_required={false}
                    placeholder={topic.input_num_users}
                    value={topic.input_num_users}
                    size={5} 
                    min_len={1}
                    max_len={4}
                    editable={isEditing}
                />
                <TextField title="Subjects" 
                    input_id="edit-form-input-num-subjects" 
                    is_number={true}
                    is_required={false} 
                    placeholder={topic.input_num_subjects}
                    value={topic.input_num_subjects}
                    size={5}
                    min_len={1}
                    max_len={4}
                    editable={isEditing}
                />
                <TextField title="Entries" 
                    input_id="edit-form-input-num-entries"
                    is_number={true} 
                    is_required={false}
                    placeholder={topic.input_num_entries} 
                    value={topic.input_num_entries}
                    size={5}
                    min_len={1} 
                    max_len={4}
                    editable={isEditing}
                />
            </div>
            
            {bottomAction}
        </div>
    );
}

export function TopicViewDataView({ topic, callback }: TopicViewCallbackProps) {

    const [isEditing, setIsEditing] = useState(false);

    let editButton = (
        <div id="topic-data-edit-button-container">
            <button className="common-button" onClick={() => setIsEditing(true)}>Edit</button>
        </div>
    );
    let submitCancelButtons = <SubmitCancelButtons onCancel={() => setIsEditing(false)} onSubmit={()=>{
        setIsEditing(false);
        callback();
    }}/>;
    let bottomAction = isEditing ? submitCancelButtons : editButton;
    
    let gridCallback = function (rowIndex: number, entryIndex: number, value: string) {
        console.log("user grid callback: rowIndex: ", rowIndex, "entryIndex: ", entryIndex, "value: ", value);
    }

    return (
        <div className="topic-view-content">
            <UserDataGridInput 
                users={createUserListForTopic(topic)} 
                ratings={createRatingsGridForTopic(topic, null)} 
                picklistCallback={()=>{}} 
                gridCallback={gridCallback} 
                inputNumEntries={Number(topic.input_num_entries)} 
                inputNumSubjects={Number(topic.input_num_subjects)} 
                picklistEditable={!isEditing} 
                gridEditable={isEditing} 
            />
            {bottomAction}
        </div>
    );
}

export default function TopicView({ topic }: TopicViewProps) {

    let values = ["Plot", "Data", "Details"];
    let cookie_id = "topic-current-view-" + topic.topic_id;
    let topic_current_view = getCookie(cookie_id);
    let [currentView, setCurrentView] = useState(topic_current_view);
    let [refresh, setRefresh] = useState(false);

    let content;
    let activeIndex = 0;
    if (currentView === "details") {
        content = <TopicViewDetailsView topic={topic} callback={()=>{setRefresh(!refresh)}}/>;
        activeIndex = 2;
    } else if (currentView === "data") {
        content = <TopicViewDataView topic={topic} callback={()=>{}}/>
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
