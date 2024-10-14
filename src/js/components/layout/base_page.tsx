
import React from 'react';
import Navbar from '../navbar/navbar';
import Toolbar from '../toolbar/toolbar';

export interface BasePageProps {
    page_content: React.ReactNode;
    toolbar_items: React.ReactNode;
};

export default function BasePage({page_content, toolbar_items}: BasePageProps) {

    return (
        <div>
            <Navbar />
            <Toolbar items={toolbar_items}/>
            <div id="page-content-container">
                <div id="page-content">
                    {page_content}
                </div>
            </div>
        </div>
    );
}
