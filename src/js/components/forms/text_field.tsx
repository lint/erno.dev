
import React from 'react';
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
}

export default function TextField({title, placeholder, input_id, is_required, min_len, max_len, size, value, is_number}: TextFieldProps) {

    function number_field_validation() {
        let num_input = document.getElementById(input_id) as HTMLInputElement;
        if (num_input) {
            num_input.value = num_input.value.replace(/\D/g, '');
        }
    }

    let onInput = is_number ? number_field_validation : () => {};
    let required_cls = is_required ? " form-required" : "";

    return (
        <div className={"form-field" + required_cls}>
            <span className="form-field-title">
                <label htmlFor={input_id}>{title}</label>
            </span>
            <span className="form-field-input">
                <input type="text" id={input_id} name={input_id} required={is_required} onInput={onInput} minLength={min_len} maxLength={max_len} size={size} defaultValue={value} placeholder={placeholder}/>
            </span>
        </div>
    );
}
