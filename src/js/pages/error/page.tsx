import React from 'react';
import BasePage from '../../components/layout/base_page';
import { useRouteError, isRouteErrorResponse } from "react-router-dom";

export default function ErrorPage() {

    const error = useRouteError();
    let message: string;

    if (isRouteErrorResponse(error)) {
        message = String(error.status);
    } else if (error instanceof Error) {
        message = error.message;
    } else if (typeof error === 'string') {
        message = error;
    } else {
        console.error(error);
        message = 'Unknown error';
    }

    return (
        <BasePage
            left_toolbar_items={<></>}
            right_toolbar_items={<></>}
            page_content={            
                <div id="error-container">
                    <div className="ultra-large-text">
                        {message}
                    </div>
                    <div className="large-text">
                        {"Sorry, the site experienced an unexpected error."}
                    </div>
                </div>
            }
        />
    );
}