
import React from 'react';
import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import BasePage from '../base_page';
import ErrorDisplay from '../../components/error/error_display';

export interface ErrorPageProps {
    message?: string;
}

export default function ErrorPage({ message }: ErrorPageProps) {

    const err = useRouteError();
    let status: string;

    if (message) {
        status = message;
    } else if (isRouteErrorResponse(err)) {
        status = String(err.status);
    } else if (err instanceof Error) {
        status = err.message;
    } else if (typeof err === 'string') {
        status = err;
    } else {
        console.error(err);
        status = 'Unknown error';
    }

    return (
        <BasePage>
            <ErrorDisplay status={status} />
        </BasePage>
    );
}