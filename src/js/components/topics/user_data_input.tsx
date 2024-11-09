
import React, { useState } from "react";
import GridInput from "../forms/grid_input";
import Picklist from "../general/picklist";
import './topics.css';
import SubmitCancelButtons from "../forms/submit_cancel";
import { createUserNameListFromUsers } from "../../util/topics";
import { generateClient } from "aws-amplify/api";
import { Schema } from "../../../../amplify/data/resource";

const client = generateClient<Schema>();

export interface UserDataGridInputProps {
    picklistCallback: (params: any) => any;
    gridCallback: (rowIndex: number, entryIndex: number, value: string) => any;
    picklistEditable: boolean;
    gridEditable: boolean;
    users: any[];
    ratings: any[];
    inputNumEntries: number;
    inputNumSubjects: number;
}

export default function UserDataGridInput({ratings, users, inputNumEntries, inputNumSubjects, picklistEditable, gridEditable, picklistCallback, gridCallback}: UserDataGridInputProps) {

    const [isEditingUserName, setIsEditingUserName] = useState(false);
    const [selectedPicklistIndex, setSelectedPicklistIndex] = useState(-1);
    const [refresh, setRefresh] = useState(false);

    if (selectedPicklistIndex < 0 && users.length > 0) {
        setSelectedPicklistIndex(0);
    }

    let selectedUser = selectedPicklistIndex >= 0 ? users[selectedPicklistIndex] : null;
    let userName = selectedUser ? selectedUser.name : "";

    let submitCancelButtons = (
        <>
        <input type="text" id={"topic-user-picklist-editable-input"} required={true} minLength={1} maxLength={256} size={15} defaultValue={userName} placeholder={userName} />
        <SubmitCancelButtons onCancel={() => setIsEditingUserName(false)} onSubmit={()=>{
            console.log("submit pressed");

            let textInput = document.getElementById("topic-user-picklist-editable-input") as HTMLInputElement;
            if (selectedUser && textInput && textInput.value !== "") {
                console.log("updating username");
                selectedUser.name = textInput.value;
                client.models.User.update(selectedUser)
                .catch(error => {
                    console.log("error: ", error);
                }).finally(() => {
                    setIsEditingUserName(false);
                });
            }

            setIsEditingUserName(false);
            setRefresh(!refresh);
            // callback();
        }}/>
        </>
    );
    let editIcon = (
        <div id="topic-user-picklist-editable-container" onClick={() => setIsEditingUserName(true)}>
            <i className="material-icons interactive-blue">edit</i>
        </div>
    );

    let editButton = isEditingUserName ? submitCancelButtons : editIcon;

    function picklistCallbackHook(params: any) {

        let newSelectedIndex = params.target.selectedPicklistIndex;

        if (newSelectedIndex < users.length) {
            setSelectedPicklistIndex(newSelectedIndex);
        }

        picklistCallback(params);
    }

    return (
        <div className="topic-user-grid-input-container">
            <div className="topic-editable-picklist-container">
                <Picklist data={createUserNameListFromUsers(users)} callback={picklistCallbackHook} labelText="User:" editable={picklistEditable && !isEditingUserName}/>
                {editButton}
            </div>
            <GridInput data={ratings} minRows={inputNumSubjects+1} minCols={inputNumEntries+1} editable={gridEditable} callback={gridCallback}/>
        </div>
    );
}
