
import React from 'react';
import BasePage from '../../components/layout/base_page';

export default function HomePage() {

    return (
        <BasePage
            left_toolbar_items={<></>}
            right_toolbar_items={<></>}
            page_content={            
                <div>
                    <ul>
                        <li>
                            <a href="/topics">topics</a>
                        </li>
                    </ul>
                </div>
            }
        />
    );
}
