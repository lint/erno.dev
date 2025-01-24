
import React from 'react';
import Navbar from '../components/navbar/navbar';
import './pages.css';

export interface BasePageProps {
    children?: React.ReactNode;
};

export default function BasePage({ children }: BasePageProps) {

    return (
        <div>
            <Navbar />
            <div id="page-content-container">
                <div id="page-content">
                    {children}
                </div>
            </div>
        </div>
    );
}
