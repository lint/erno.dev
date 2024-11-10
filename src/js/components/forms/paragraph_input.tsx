

import React from 'react';
import './forms.css';

export interface ParagraphInputProps {
    title: string;
    placeholder: string;
    input_id: string;
    is_required: boolean;
    value: string;
    editable: boolean;
    cols: number;
    rows: number;
    onFocusOut?: () => any;
    callback?: () => any;
}

export default function ParagraphInput({title, placeholder, input_id, is_required, cols, rows, value, editable, onFocusOut, callback}: ParagraphInputProps) {

    let required_cls = is_required ? " form-required" : "";

    return (
        <div className={"form-paragraph" + required_cls}>
            <div className="form-paragraph-title">
                <label htmlFor={input_id}>{title}</label>
            </div>
            <textarea disabled={!editable} id={input_id} cols={cols} rows={rows} placeholder={placeholder} defaultValue={value} onBlur={onFocusOut} onChange={callback}></textarea>
        </div>
    );
}
