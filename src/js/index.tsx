// css styles
import "../css/style.css";

// react base
import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// react components
import ErrorPage from "./pages/error/error_page";
import HomePage from "./pages/home/home_page";
import MapPage from "./pages/maps/map_page";
import TempPage from "./pages/temp_page";

// amplify
import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";

// mantine ui
import { createTheme, MantineProvider, virtualColor } from "@mantine/core";
import "@mantine/core/styles.css";
import CanvasDashboardPage from "./pages/canvas/canvas_dashboard_page";
import CanvasPage from "./pages/canvas/canvas_page";

// configure application
Amplify.configure(outputs);
const root = createRoot(document.getElementById("app")!);
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/about",
    element: <TempPage />,
  },
  {
    path: "/map",
    element: <MapPage />,
  },
  {
    path: "/canvas",
    element: <CanvasDashboardPage />,
  },
  {
    path: "/canvas/:id",
    element: <CanvasPage />,
  },
]);

// create mantine theme
const theme = createTheme({
  fontFamily:
    "font-family: -apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue, helvetica, Cantarell, Ubuntu, roboto, noto, arial, sans-serif", // https://systemfontstack.com
  colors: {
    primary: virtualColor({
      name: "primary",
      dark: "pink",
      light: "cyan",
    }),
  },
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
