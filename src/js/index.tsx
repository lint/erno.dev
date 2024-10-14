// css styles
import '../css/style.css';

// react base
import React from 'react';
import { createRoot } from 'react-dom/client';

// react components
import Navbar from './components/navbar/navbar.tsx'
import Dashboard from './components/dashboard/dashboard.tsx'

// amplify
import { Amplify } from 'aws-amplify';
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import outputs from '../../amplify_outputs.json';

// configure amplify
Amplify.configure(outputs);
const client = generateClient<Schema>();

// configure react
const root = createRoot(document.getElementById('app')!);

// listen for when the page is ready
document.addEventListener("DOMContentLoaded", function () {

    renderHome();
});

// render the home page
function renderHome() {

    root.render(
        <div>
            <Navbar/>
        </div>
    );
}


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