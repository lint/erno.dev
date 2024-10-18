
import React from 'react';
import Navbar from '../components/navbar/navbar';
import './page.css';

export interface BasePageProps {
    page_content: React.ReactNode;
    left_toolbar_items: React.ReactNode;
    right_toolbar_items: React.ReactNode;
};

export default function BasePage({page_content, left_toolbar_items, right_toolbar_items}: BasePageProps) {

    return (
        <div>
            <Navbar left={left_toolbar_items} right={right_toolbar_items}/>
            <div id="page-content-container">
                <div id="page-content">
                    {page_content}
                </div>
            </div>
        </div>
    );
}
