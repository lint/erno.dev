
import React from "react";
import GridInput from "../forms/grid_input";
import Picklist from "../general/picklist";
import './topics.css';

export interface UserDataGridInputProps {
    callback: (params: any) => any;
    picklistEditable: boolean;
    gridEditable: boolean;
    users: any[];
    ratings: any[];
}

export default function UserDataGridInput({ratings, users, picklistEditable, gridEditable, callback}: UserDataGridInputProps) {

    return (
        <div className="topic-user-grid-input-container">
            <Picklist data={users} callback={callback} labelText="User:" editable={picklistEditable}/>
            <GridInput data={ratings} editable={gridEditable}/>
        </div>
    );
}
