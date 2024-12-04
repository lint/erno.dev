
import React from 'react';
import './pages.css';

export default function TempPage() {

    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      }

    function randomizePageColor() {
        let container = document.getElementById("temp-container");
        let eyes = document.getElementById("temp-eyes");

        if (container && eyes) {
            container.style.backgroundColor = getRandomColor();
            eyes.style.color = getRandomColor();
        }
    }

    return (
        <div id="temp-container">
            <div id="temp-eyes" onClick={randomizePageColor}>0_o</div>
        </div>
    );
}
