
import React from 'react';
import ContentHeader from '../layout/content/header';
import TextField from '../forms/text_field';
import './topics.css';

export default function TopicCreateForm() {
    
    return (
        <div>
            <ContentHeader text="Create Topic" />
            <div>
                <TextField title="Topic Name" input_id="create-form-input-title" placeholder="" required={true} is_number={false}/>
            </div>
        </div>
    );
}
