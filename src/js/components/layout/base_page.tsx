
import React from 'react';
import Navbar from '../navbar/navbar';
import Toolbar from '../toolbar/toolbar';
import ParentProps from '../interfaces/parent_props';

export default function BasePage({children}: ParentProps) {
// const BasePage: React.FC<ParentProps> = ({ children }) => {
    
    // let toolbar_items = null;

    // if (children && children.length >= 2) {
    //     toolbar_items = children[0];
    // }


    return (
        <div>
            <Navbar />
            <Toolbar>
            </Toolbar>
            <div id="page-content-container">
                <div id="page-content">
                    {children}
                </div>
            </div>
        </div>
    );
}

// export default BasePage;
