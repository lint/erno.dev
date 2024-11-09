
import React from "react";
import GridInput from "../forms/grid_input";
import Picklist from "../general/picklist";
import './topics.css';

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

    return (
        <div className="topic-user-grid-input-container">
            <Picklist data={users} callback={picklistCallback} labelText="User:" editable={picklistEditable}/>
            <GridInput data={ratings} minRows={inputNumSubjects+1} minCols={inputNumEntries+1} editable={gridEditable} callback={gridCallback}/>
        </div>
    );
}
