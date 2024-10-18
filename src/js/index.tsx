
// css styles
import '../css/style.css';

// react base
import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, } from "react-router-dom";

// react components
import HomePage from './pages/home/home_page';
import ErrorPage from './pages/error/error_page';
import TopicsPage from './pages/topics/dashboard_page';
import TopicCreatePage from './pages/topics/create_page';
import TopicViewPage from './pages/topics/view_page';

// amplify
import { Amplify } from 'aws-amplify';
// import { generateClient } from "aws-amplify/data";
// import type { Schema } from "../../amplify/data/resource";
import outputs from '../../amplify_outputs.json';

// configure amplify
Amplify.configure(outputs);
// const client = generateClient<Schema>();

// configure react
const root = createRoot(document.getElementById('app')!);
const router = createBrowserRouter([
    {
        path: "/",
        element: <HomePage />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/topics",
        element: <TopicsPage />,
    },
    {
        path: "/topics/create",
        element: <TopicCreatePage />,
    },
    {
        path: "/topics/:topic_id",
        element: <TopicViewPage />
    }
]);

// create page router for the app
export default function App() {
    return (
        <React.StrictMode>
            <RouterProvider router={router} />
        </React.StrictMode>
    );
}

// listen for when the page is ready
document.addEventListener("DOMContentLoaded", function () {
    root.render(<App />);
});

// document.addEventListener("DOMContentLoaded", function () {
//     const todos: Array<Schema["Todo"]["type"]> = [];
//     const todoList = document.getElementById("todoList") as HTMLUListElement;
//     const addTodoButton = document.getElementById("addTodo") as HTMLButtonElement;

//     addTodoButton.addEventListener("click", createTodo);

//     function updateUI() {
//         todoList.innerHTML = '';
//         todos.forEach(todo => {
//             const li = document.createElement('li');
//             li.textContent = todo.content ?? '';
//             todoList.appendChild(li);
//         });
//     }

//     function createTodo() {
//       console.log('createTodo');
//       const content = window.prompt("Todo content");
//       if (content) {
//           client.models.Todo.create({ content }).then(response => {
//               if (response.data && !response.errors) {
//                   todos.push(response.data);
//                   updateUI();
//               } else {
//                   console.error('Error creating todo:', response.errors);
//                   alert('Failed to create todo.');
//               }
//           }).catch(error => {
//               console.error('Network or other error:', error);
//               alert('Failed to create todo due to a network or other error.');
//           });
//       }
//   }
  

//     client.models.Todo.observeQuery().subscribe({
//         next: (data) => {
//             todos.splice(0, todos.length, ...data.items);
//             updateUI();
//         }
//     });
// });
