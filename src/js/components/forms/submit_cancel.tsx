
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../../util/cookies';

import './forms.css';

export interface SubmitCancelButtonsProps {

}

export default function SubmitCancelButtons({}:SubmitCancelButtonsProps) {
    const navigate = useNavigate();

    function handle_cancel() {
        navigate(getCookie("create-topic-url-ref") ?? "/topics");
    }

    return (
        <div className="submit-cancel-container">
            <button className="common-button cancel-button" onClick={handle_cancel}>Cancel</button>
            <button className="common-button submit-button" onClick={()=>{}}>Submit</button>
        </div>
    );
}