
import React from 'react';
import { Link } from 'react-router-dom';
import BasePage from '../base_page';

export default function CanvasDashboardPage() {

    return (
        <BasePage>
            <ul>
                <li>
                    <Link to="/canvas/test">Test</Link>
                </li>
            </ul>
        </BasePage>
    );
}
