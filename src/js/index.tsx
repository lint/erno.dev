
// css styles
import '../css/style.css';

// react base
import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, } from "react-router-dom";

// react components
import HomePage from './pages/home/home_page';
import ErrorPage from './pages/error/error_page';
import TempPage from './pages/temp_page';
import MapsDashboardPage from './pages/maps/maps_dashboard_page';
import MapPage from './pages/maps/map_page';

// amplify
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';

// mantine ui
import '@mantine/core/styles.css';
import { createTheme, MantineProvider } from '@mantine/core';

// configure application
Amplify.configure(outputs);
const root = createRoot(document.getElementById('app')!);
const router = createBrowserRouter([
    {
        path: "/",
        element: <HomePage />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/about",
        element: <TempPage />
    },
    {
        path: "/maps",
        element: <MapsDashboardPage />
    },
    {
        path: "/maps/:mapId",
        element: <MapPage />
    }
]);

// create mantine theme
const theme = createTheme({
    fontFamily: "font-family: -apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue, helvetica, Cantarell, Ubuntu, roboto, noto, arial, sans-serif", // https://systemfontstack.com
});

// main app component
export default function App() {
    return (
        <React.StrictMode>
            <MantineProvider theme={theme}>
                <RouterProvider router={router} />
            </MantineProvider>
        </React.StrictMode>
    );
}

// listen for when the page is ready
document.addEventListener("DOMContentLoaded", function () {
    root.render(<App />);
});
