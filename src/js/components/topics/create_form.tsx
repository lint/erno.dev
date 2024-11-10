
import React, { useState } from 'react';
import TextField from '../forms/text_field';
import ContentGroup from '../general/content_group';
import SubmitCancelButtons from '../forms/submit_cancel';
import { getCookie, setCookie } from '../../util/cookies';
import { Link, useNavigate } from 'react-router-dom';
import './topics.css';
import ContentContainer from '../general/content_container';
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../../amplify/data/resource";
import { getNextTopicId, getUniqueTopicName } from '../../util/topics';
import ParagraphInput from '../forms/paragraph_input';

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
    const topicCsvDataPlaceholder = "";
    
    const [topicName, setTopicName] = useState(topicNamePlaceholder);
    const [topicCsvData, setTopicCsvData] = useState(topicCsvDataPlaceholder);

    function cancelCreate() {
        navigate(getCookie("create-topic-url-ref") ?? "/topics");
    }

    const createTopic = async () => {

        let max_id = 0;

        console.log("creating topic with name: ", topicName, "csvData: \n", topicCsvData);

        // TODO: getting the next ID can be done in a much better way
        client.models.Topic.list().then(res => {

            if (!res.data || res.errors) {
                throw new Error("Error getting topics:" + res.errors);
            }

            let topics = res.data;
            max_id = getNextTopicId(topics);
            let name = getUniqueTopicName(topics, topicName);

            // TODO: validate csv data

            return client.models.Topic.create({
                name: name,
                topic_id: String(max_id),
                csvData: topicCsvData
            });

        }).then(res => {

            console.log("created topic: ", res.data);

            if (!res.data || res.errors) {
                throw new Error("Error creating topic:" + res.errors);
            }
            
            navigate("/topics");
        }).catch(error => {
            console.error("Error: ", error);
            alert("Failed to create topic...");
        });
    }

    function setupFormChanged() {
        let nameInput = document.getElementById("create-form-input-title" ) as HTMLInputElement;
        let csvDataInput = document.getElementById("create-form-input-csv-data") as HTMLTextAreaElement;

        if (nameInput && nameInput.value !== "") {
            setTopicName(nameInput.value);
        } else {
            setTopicName(topicNamePlaceholder);
        }
        if (csvDataInput && csvDataInput.value !== "") {
            setTopicCsvData(csvDataInput.value);
        } else {
            setTopicCsvData(topicCsvDataPlaceholder);
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
                    </div>
                </ContentGroup>
                <ContentGroup title="Import">
                    <>
                    <input type="file"></input>
                    </>
                </ContentGroup>
                <ContentGroup title="Edit">
                    <>
                    <ParagraphInput title="Data" placeholder={topicCsvDataPlaceholder} value="" input_id="create-form-input-csv-data" is_required={false} editable={true} cols={40} rows={30} callback={setupFormChanged}/>
                    </>
                </ContentGroup>
            </div>
            <SubmitCancelButtons onCancel={cancelCreate} onSubmit={createTopic}/>
            </>
        </ContentContainer>
    );
}
