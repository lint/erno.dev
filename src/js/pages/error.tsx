
import React from 'react';
import BasePage from '../components/layout/base_page';

export default function ErrorPage() {

    return (
        <BasePage
            toolbar_items={<></>} 
            page_content={            
                <div>
                    404
                </div>
            }
        />
    );
}
