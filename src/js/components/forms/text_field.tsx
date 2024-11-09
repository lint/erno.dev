
import React from 'react';
import { numberFieldValidation } from '../../util/validation';
import './forms.css';

export interface TextFieldProps {
    title: string;
    placeholder: string;
    input_id: string;
    is_number: boolean;
    is_required: boolean;
    min_len: number;
    max_len: number;
    size: number;
    value: string;
    editable: boolean;
    onFocusOut?: () => any;
}

export default function TextField({title, placeholder, input_id, is_required, min_len, max_len, size, value, is_number, editable, onFocusOut}: TextFieldProps) {

    let onInput = is_number ? numberFieldValidation : () => {};
    let required_cls = is_required ? " form-required" : "";

    let textInput = <input type="text" id={input_id} name={input_id} required={is_required} onInput={onInput} onBlur={onFocusOut} minLength={min_len} maxLength={max_len} size={size} defaultValue={value} placeholder={placeholder}/>;
    let textStatic = <div>{value}</div>;
    let textDisplay = editable ? textInput : textStatic;

    return (
        <div className={"form-field" + required_cls}>
            <span className="form-field-title">
                <label htmlFor={input_id}>{title}</label>
            </span>
            <span className="form-field-input">
                {textDisplay}
            </span>
        </div>
    );
}
