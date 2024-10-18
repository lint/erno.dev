
import React from 'react';

import './forms.css';

export interface SubmitCancelButtonsProps {
    onCancel: (params: any) => any;
    onSubmit: (params: any) => any;
}

export default function SubmitCancelButtons({onCancel, onSubmit}: SubmitCancelButtonsProps) {


    return (
        <div className="submit-cancel-container">
            <button className="common-button cancel-button" onClick={onCancel}>Cancel</button>
            <button className="common-button submit-button" onClick={onSubmit}>Submit</button>
        </div>
    );
}
