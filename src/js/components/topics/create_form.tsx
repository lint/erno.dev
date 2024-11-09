
import React, { useState } from 'react';
import TextField from '../forms/text_field';
import ContentGroup from '../general/content_group';
import SubmitCancelButtons from '../forms/submit_cancel';
import { getCookie, setCookie } from '../../util/cookies';
import { Link, useNavigate } from 'react-router-dom';
import './topics.css';
import ContentContainer from '../general/content_container';
import UserDataGridInput from './user_data_input';
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../../amplify/data/resource";
import { getNextTopicId, getUniqueTopicName } from '../../util/topics';

const client = generateClient<Schema>();

export function TopicCreateRightToolbarItems() {
    return (
        <div className="toolbar-items">
            <TopicCreateFormButton className="common-button" text="+ Create" />
        </div>
    );
}

export interface TopicCreateFormButtonProps {
    className: string;
    text: string;
}

export function TopicCreateFormButton({className, text}: TopicCreateFormButtonProps) {
    
    function handle_create() {
        if (location.pathname !== "/topics/create") {
            setCookie("create-topic-url-ref", location.pathname, 365);
        }
    }

    return (
        <Link className="unset" to="/topics/create">
            <button className={className} onClick={handle_create}>{text}</button>
        </Link>
    );
}

export default function TopicCreateForm() {
    
    const navigate = useNavigate();

    const topicNamePlaceholder = "My New Topic";
    const topicNumUsersPlaceholder = "2";
    const topicNumSubjectsPlaceholder = "6";
    const topicNumEntriesPlaceholder = "4";
    
    const [topicName, setTopicName] = useState(topicNamePlaceholder);
    const [topicNumUsers, setTopicNumUsers] = useState(topicNumUsersPlaceholder);
    const [topicNumSubjects, setTopicNumSubjects] = useState(topicNumSubjectsPlaceholder);
    const [topicNumEntries, setTopicNumEntries] = useState(topicNumEntriesPlaceholder);

    function cancelCreate() {
        navigate(getCookie("create-topic-url-ref") ?? "/topics");
    }

    const createTopic = async () => {

        let max_id = 0;

        console.log("creating topic with name: ", topicName, "numUsers: ", topicNumUsers, "numSubjects: ", topicNumSubjects, "numEntries: ", topicNumEntries);

        // TODO: getting the next ID can be done in a much better way
        client.models.Topic.list().then(res => {

            if (!res.data || res.errors) {
                throw new Error("Error getting topics:" + res.errors);
            }

            let topics = res.data;
            max_id = getNextTopicId(topics);
            let name = getUniqueTopicName(topics, topicName);

            return client.models.Topic.create({
                name: name,
                input_num_entries: Number(topicNumEntries),
                input_num_users: Number(topicNumUsers),
                input_num_subjects: Number(topicNumSubjects),
                topic_id: String(max_id),
            });

        }).then(res => {

            console.log("created topic: ", res.data);

            if (!res.data || res.errors) {
                throw new Error("Error creating topic:" + res.errors);
            }

            let userPromises = [];
            for (let i = 0; i < Number(topicNumUsers); i++) {
                userPromises.push(client.models.User.create({
                    name: "User " + (i + 1),
                    user_id: "topic-"+String(max_id)+"-user-"+(i+1),
                    topic_id: String(max_id)
                }));
            }

            return Promise.all(userPromises);

        }).then(values => {
        
            console.log("created users: ", values);
            
            navigate("/topics");
        }).catch(error => {
            console.error("Error: ", error);
            alert("Failed to create topic...");
        });
    }

    function setupFormChanged() {
        let nameInput = document.getElementById("create-form-input-title" ) as HTMLInputElement;
        let numUsersInput = document.getElementById("create-form-input-num-users") as HTMLInputElement;
        let numSubjectsInput = document.getElementById("create-form-input-num-subjects") as HTMLInputElement;
        let numEntriesInput = document.getElementById("create-form-input-num-entries") as HTMLInputElement;

        if (nameInput && nameInput.value !== "") {
            setTopicName(nameInput.value);
        } else {
            setTopicName(topicNamePlaceholder);
        }
        if (numUsersInput && numUsersInput.value !== "") {
            setTopicNumUsers(numUsersInput.value);
        } else {
            setTopicNumUsers(topicNumUsersPlaceholder);
        }
        if (numSubjectsInput && numSubjectsInput.value !== "") {
            setTopicNumSubjects(numSubjectsInput.value);
        } else {
            setTopicNumSubjects(topicNumSubjectsPlaceholder);
        }
        if (numEntriesInput && numEntriesInput.value !== "") {
            setTopicNumEntries(numEntriesInput.value);
        } else {
            setTopicNumEntries(topicNumEntriesPlaceholder);
        }
    }

    return (
        <ContentContainer header_text="Create Topic">
            <>
            <div>
                <ContentGroup title="Setup">
                    <div>
                        <TextField
                            title="Topic Name" 
                            input_id="create-form-input-title" 
                            is_number={false} 
                            is_required={true} 
                            placeholder={topicNamePlaceholder} 
                            value="" 
                            size={30} 
                            min_len={1} 
                            max_len={256} 
                            editable={true}
                            onFocusOut={setupFormChanged}
                        />
                        <TextField 
                            title="Users" 
                            input_id="create-form-input-num-users" 
                            is_number={true} 
                            is_required={false} 
                            placeholder={topicNumUsersPlaceholder} 
                            value="" 
                            size={5} 
                            min_len={1} 
                            max_len={3} 
                            editable={true}
                            onFocusOut={setupFormChanged}
                        />
                        <TextField 
                            title="Subjects" 
                            input_id="create-form-input-num-subjects" 
                            is_number={true} 
                            is_required={false} 
                            placeholder={topicNumSubjectsPlaceholder} 
                            value="" 
                            size={5} 
                            min_len={1} 
                            max_len={3} 
                            editable={true}
                            onFocusOut={setupFormChanged}
                        />
                        <TextField 
                            title="Entries" 
                            input_id="create-form-input-num-entries" 
                            is_number={true} 
                            is_required={false} 
                            placeholder={topicNumEntriesPlaceholder} 
                            value="" 
                            size={5} 
                            min_len={1} 
                            max_len={3} 
                            editable={true}
                            onFocusOut={setupFormChanged}
                        />
                    </div>
                </ContentGroup>
                <ContentGroup title="Import">
                    <>
                    <input type="file"></input>
                    </>
                </ContentGroup>
                <ContentGroup title="Input">
                    <>
                    <UserDataGridInput 
                        users={[]} 
                        ratings={[]} 
                        picklistCallback={()=>{}} 
                        gridCallback={()=>{}} 
                        inputNumEntries={Number(topicNumEntries)}
                        inputNumSubjects={Number(topicNumSubjects)} 
                        picklistEditable={true} 
                        gridEditable={true}
                    />
                    </>
                </ContentGroup>
            </div>
            <SubmitCancelButtons onCancel={cancelCreate} onSubmit={createTopic}/>
            </>
        </ContentContainer>
    );
}
