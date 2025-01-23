
// css styles
import '../css/style.css';

// react base
import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, } from "react-router-dom";

// react components
// import HomePage from './pages/home/home_page';
// import ErrorPage from './pages/error/error_page';
// import TopicsDashboardPage from './pages/topics/dashboard_page';
// import TopicCreatePage from './pages/topics/create_page';
// import TopicViewPage from './pages/topics/view_page';
import TempPage from './pages/temp_page';
import MapsDashboardPage from './pages/maps/maps_dashboard_page';

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
        // element: <HomePage />,
        element: <TempPage />,
        errorElement: <TempPage />,
    },
    // {
    //     path: "/topics",
    //     element: <TopicsDashboardPage />,
    // },
    // {
    //     path: "/topics/create",
    //     element: <TopicCreatePage />,
    // },
    // {
    //     path: "/topics/:topic_id",
    //     element: <TopicViewPage />
    // },
    {
        path: "/map",
        element: <MapsDashboardPage />
    }
]);

// create mantine theme
const theme = createTheme({
    /** Put your mantine theme override here */
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
