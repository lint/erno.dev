
import React, { useState } from 'react';
import './topics.css';
import ContentContainer from '../general/content_container';
import ContentGroup from '../general/content_group';
import { getCookie, setCookie } from '../../util/cookies';
import SegmentSelect from '../general/segment_select';
import TextField from '../forms/text_field';
import SubmitCancelButtons from '../forms/submit_cancel';
import UserDataGridInput from './user_data_input';

export interface TopicViewProps {
    topic: any;
}

export interface TopicViewCallbackProps {
    topic: any;
    callback: () => any;
}

export interface TopicViewDataProps {
    ratings: any[];
    users: any[];
    subjects: any[];
    callback: () => any;
}

export function TopicViewPlotView() {
    return (
        <div>plot</div>
    );
}

export function TopicViewDetailsView({topic, callback}: TopicViewCallbackProps) {

    const [isEditing, setIsEditing] = useState(false);

    let editButton = (
        <div id="topic-details-edit-button-container">
            <button className="common-button" onClick={() => setIsEditing(true)}>Edit</button>
        </div>
    );
    let submitCancelButtons = <SubmitCancelButtons onCancel={() => setIsEditing(false)} onSubmit={()=>{
        topic.name = (document.getElementById("edit-form-input-title") as HTMLInputElement).value;
        topic.num_users = (document.getElementById("edit-form-input-num-users") as HTMLInputElement).value;
        topic.num_subjects = (document.getElementById("edit-form-input-num-subjects") as HTMLInputElement).value;
        topic.num_entries = (document.getElementById("edit-form-input-num-entries") as HTMLInputElement).value;
        setIsEditing(false);
        callback();
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
                    placeholder={topic.num_users}
                    value={topic.num_users}
                    size={5} 
                    min_len={1}
                    max_len={4}
                    editable={isEditing}
                />
                <TextField title="Subjects" 
                    input_id="edit-form-input-num-subjects" 
                    is_number={true}
                    is_required={false} 
                    placeholder={topic.num_subjects}
                    value={topic.num_subjects}
                    size={5}
                    min_len={1}
                    max_len={4}
                    editable={isEditing}
                />
                <TextField title="Entries" 
                    input_id="edit-form-input-num-entries"
                    is_number={true} 
                    is_required={false}
                    placeholder={topic.num_entries} 
                    value={topic.num_entries}
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

export function TopicViewDataView({users, ratings, callback }: TopicViewDataProps) {

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

    return (
        <div className="topic-view-content">
            <UserDataGridInput users={users} ratings={ratings} callback={()=>{}} picklistEditable={!isEditing} gridEditable={isEditing} />
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

    let gridData = [["", "col2", "col3"], ["Person1", 2, 3], ["Person2", 3, 4]];
    let picklistData = [
        {
            text: "User 1",
            value: "user_1"
        },
        {
            text: "User 2",
            value: "user_2"
        }
    ];

    let content;
    let activeIndex = 0;
    if (currentView === "details") {
        content = <TopicViewDetailsView topic={topic} callback={()=>{setRefresh(!refresh)}}/>;
        activeIndex = 2;
    } else if (currentView === "data") {
        content = <TopicViewDataView users={picklistData} ratings={gridData} subjects={[]} callback={()=>{}}/>
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
