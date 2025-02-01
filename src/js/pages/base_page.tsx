
import React from 'react';
import Navbar from '../components/navbar/navbar';
import './pages.css';

export interface BasePageProps {
    children?: React.ReactNode;
};

export default function BasePage({ children }: BasePageProps) {

    return (
        <div className="base-page">
            <Navbar />
            <div className="base-body">
                {children}
            </div>
        </div>
    );
}
