
import React from 'react';
import BasePage from '../base_page';
import { Link } from 'react-router-dom';

export default function MapsDashboardPage() {

    return (
        <BasePage>
            <ul>
                <li>
                    <Link to="/maps/address">Address</Link>
                </li>
            </ul>
        </BasePage>
    );
}
