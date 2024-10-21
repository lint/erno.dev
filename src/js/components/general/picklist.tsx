
import React from "react";
import './general.css';

export interface PicklistProps {
    data: any[];
    callback: (params: any) => any;
    id?: string;
    labelText: string;
    editable: boolean;
}

export default function Picklist({data, callback, id, labelText, editable}: PicklistProps) {

    return (
        <div className="picklist">
            <label htmlFor={id}>{labelText}</label>
            <select disabled={!editable} id={id} onChange={callback}>
                {data.map((entry, entryIndex) => (
                    <option key={"key-entry-" + entryIndex} defaultValue={entry.value}>{entry.text}</option>
                ))}
            </select>
        </div>
    );
}
