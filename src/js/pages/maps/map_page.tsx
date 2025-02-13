
import React from 'react';
import { BinMap } from '../../components/maps/BinMap';
import BasePage from '../base_page';
import { useParams } from 'react-router-dom';
import ErrorPage from '../error/error_page';

export default function MapPage() {

    const { mapId } = useParams();
    let mapComponent = null;

    switch (mapId) {
        case 'bin':
            mapComponent = <BinMap />;
            break;
        default:
            return (
                <ErrorPage message="404" />
            );
    }

    return (
        <BasePage>
            {mapComponent}
        </BasePage>
    );
}
