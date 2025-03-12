
import React from 'react';
import { BinMap } from '../../components/maps/BinMap';
import BasePage from '../base_page';
// import { useParams } from 'react-router-dom';
// import ErrorPage from '../error/error_page';

export default function MapPage() {

    return (
        <BasePage>
            <BinMap />
        </BasePage>
    );
}
