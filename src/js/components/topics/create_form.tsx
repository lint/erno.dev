
import React from 'react';
import ContentHeader from '../layout/content/header';
import TextField from '../forms/text_field';
import FormGroup from '../forms/form_group';
import SubmitCancelButtons from '../forms/submit_cancel';
import './topics.css';

export default function TopicCreateForm() {
    
    return (
        <div>
            <ContentHeader text="Create Topic" />
            <div id="create-topic-form">
                <div>
                    <FormGroup title="Setup">
                        <>
                        <TextField title="Topic Name" input_id="create-form-input-title" is_number={false} is_required={true} placeholder="My New Topic" value="" size={30} min_len={1} max_len={256} />
                        <TextField title="Users" input_id="create-form-input-num-users" is_number={true} is_required={false} placeholder="2" value="" size={5} min_len={1} max_len={4} />
                        <TextField title="Subjects" input_id="create-form-input-num-subjects" is_number={true} is_required={false} placeholder="6" value="" size={5} min_len={1} max_len={4} />
                        <TextField title="Entries" input_id="create-form-input-num-entries" is_number={true} is_required={false} placeholder="4" value="" size={5} min_len={1} max_len={4} />
                        </>
                    </FormGroup>
                    <FormGroup title="Import">
                        <>
                        <input type="file"></input>
                        </>
                    </FormGroup>
                    <FormGroup title="Input">
                        <>
                        </>
                    </FormGroup>
                </div>
                <SubmitCancelButtons />
            </div>
        </div>
    );
}
