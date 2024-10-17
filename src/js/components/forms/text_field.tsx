
import React from 'react';
import './forms.css';

export interface TextFieldProps {
    title: string;
    placeholder: string;
    input_id: string;
    is_number: boolean;
    required: boolean;
}

export default function TextField({title, placeholder, input_id} : TextFieldProps) {

    // <input type="text" id="num-buildings-input" name="num_buildings" required minlength="1" maxlength="8" size="10" value="25" placeholder="e.g. 25"
    // oninput="this.value = this.value.replace(/\D/g, '');"/>

    // let number_input = <input type="text" id={input_id} name="topic_name" placeholder={placeholder} />;
    // let string_input = <input type="text" id={input_id} name="topic_name" placeholder={placeholder} />;

    return (
        <div className="form-field-container">
            <span className="form-field-title">
                
                <label htmlFor={input_id}>{title}</label>
            </span>
            <span className="form-field-input">
                <input type="text" id={input_id} name="topic_name" placeholder={placeholder} />
            </span>
        </div>
    );
}
