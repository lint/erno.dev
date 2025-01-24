
import React from 'react';
import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import BasePage from '../base_page';
import ErrorDisplay from '../../components/error/error_display';

export default function ErrorPage() {

    const err = useRouteError();
    let message: string;

    if (isRouteErrorResponse(err)) {
        message = String(err.status);
    } else if (err instanceof Error) {
        message = err.message;
    } else if (typeof err === 'string') {
        message = err;
    } else {
        console.error(err);
        message = 'Unknown error';
    }

    return (
        <BasePage>
            <ErrorDisplay status={message} />
        </BasePage>
    );
}