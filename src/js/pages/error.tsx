
import React from 'react';
import BasePage from '../components/layout/base_page';

export default function ErrorPage() {

    return (
        <BasePage
            left_toolbar_items={<></>}
            right_toolbar_items={<></>}
            page_content={            
                <div>
                    404
                </div>
            }
        />
    );
}
