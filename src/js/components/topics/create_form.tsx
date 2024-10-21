
import React from 'react';
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

    function cancelCreate() {
        navigate(getCookie("create-topic-url-ref") ?? "/topics");
    }

    const createTopic = async () => {

        let name        = (document.getElementById("create-form-input-title") as HTMLInputElement).value;
        // let numUsers    = (document.getElementById("create-form-input-num-users") as HTMLInputElement).value;
        // let numSubjects = (document.getElementById("create-form-input-num-subjects") as HTMLInputElement).value;
        let numEntries  = (document.getElementById("create-form-input-num-entries") as HTMLInputElement).value;

        client.models.Topic.list().then(res => {

            if (!res.data || res.errors) {
                throw new Error("Error getting topics:" + res.errors);
            }

            let topics = res.data;
            let max_id = 0;
            topics.forEach(topic => {
                if (Number(topic.topic_id) > Number(max_id)) {
                    max_id = Number(topic.topic_id);
                }
            });
            max_id++;

            return client.models.Topic.create({
                name: name,
                length: Number(numEntries),
                topic_id: String(max_id),
            });

        }).then(res => {

            if (!res.data || res.errors) {
                throw new Error("Error creating topic:" + res.errors);
            }

            navigate("/topics");

        }).catch(error => {
            console.error("Error: ", error);
            alert("Failed to create topic...");
        });
    }

    return (
        <ContentContainer header_text="Create Topic">
            <>
            <div>
                <ContentGroup title="Setup">
                    <>
                    <TextField title="Topic Name" input_id="create-form-input-title" is_number={false} is_required={true} placeholder="My New Topic" value="" size={30} min_len={1} max_len={256} editable={true} />
                    <TextField title="Users" input_id="create-form-input-num-users" is_number={true} is_required={false} placeholder="2" value="" size={5} min_len={1} max_len={4} editable={true} />
                    <TextField title="Subjects" input_id="create-form-input-num-subjects" is_number={true} is_required={false} placeholder="6" value="" size={5} min_len={1} max_len={4} editable={true} />
                    <TextField title="Entries" input_id="create-form-input-num-entries" is_number={true} is_required={false} placeholder="4" value="" size={5} min_len={1} max_len={4} editable={true}/>
                    </>
                </ContentGroup>
                <ContentGroup title="Import">
                    <>
                    <input type="file"></input>
                    </>
                </ContentGroup>
                <ContentGroup title="Input">
                    <>
                    <UserDataGridInput users={[]} ratings={[]} callback={()=>{}} picklistEditable={true} gridEditable={true} />
                    </>
                </ContentGroup>
            </div>
            <SubmitCancelButtons onCancel={cancelCreate} onSubmit={createTopic}/>
            </>
        </ContentContainer>
    );
}
