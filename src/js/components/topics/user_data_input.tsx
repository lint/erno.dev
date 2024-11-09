
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
    const [selectedUser, setSelectedUser] = useState(users.length > 0 ? users[0] : null);
    const [refresh, setRefresh] = useState(false);

    if (!selectedUser && users.length > 0) {
        setSelectedUser(users[0]);
    }

    let userName = selectedUser ? selectedUser.name : "User";
    console.log("UserDataGridInput: users: ", users);
    console.log("selectedUser: ", selectedUser, "userName: ", userName)
    console.log(users.length); 

    // TODO: issue where editing the user name when you first load in does not update the name in the picklist
    // it looks like that updating the selectedUser does not update the users array in the picklist? since even though the user is updated, the createUserFromUsers call still prints the user as having the original username
    // however, after selecting an option in the picklist, editing the name works as expected

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

        let selectedIndex = params.target.selectedIndex;

        if (selectedIndex < users.length) {
            setSelectedUser(users[selectedIndex]);
        }

        picklistCallback(params);
    }

    return (
        <div className="topic-user-grid-input-container">
            <div className="topic-editable-picklist-container">
                <Picklist data={createUserNameListFromUsers(users)} callback={picklistCallbackHook} labelText="User:" editable={picklistEditable}/>
                {editButton}
            </div>
            <GridInput data={ratings} minRows={inputNumSubjects+1} minCols={inputNumEntries+1} editable={gridEditable} callback={gridCallback}/>
        </div>
    );
}
