
import React from 'react';
import { Map } from '../../components/maps/Map';
import BasePage from '../base_page';
// import { useParams } from 'react-router-dom';
// import ErrorPage from '../error/error_page';

export default function MapPage() {

    return (
        <BasePage>
            <Map />
        </BasePage>
    );
}
