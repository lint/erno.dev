
import React from 'react';
import Navbar from '../components/navbar/navbar'

export default function HomePage() {

    return (
        <div>
            <Navbar />
            <div>
                <ul>
                    <li>
                        <a href="/topics">topics</a>
                    </li>
                </ul>
            </div>
        </div>
    );
}
