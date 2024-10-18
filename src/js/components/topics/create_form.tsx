
import React from 'react';
import ContentHeader from '../layout/content/header';
import TextField from '../forms/text_field';
import FormGroup from '../forms/form_group';
import './topics.css';

export default function TopicCreateForm() {
    
    return (
        <div>
            <ContentHeader text="Create Topic" />
            <div id="create-topic-form">
                <FormGroup title="Setup">
                    <>
                    <TextField title="Topic Name" input_id="create-form-input-title" is_number={false} is_required={true} placeholder="" value="" size={-1} min_len={1} max_len={42} />
                    <TextField title="Number of Users" input_id="create-form-input-num-users" is_number={true} is_required={false} placeholder="" value="" size={-1} min_len={1} max_len={3} />
                    </>
                </FormGroup>
            </div>
        </div>
    );
}
