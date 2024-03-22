// for light and dark themes
toggleButton = document.querySelector(".toggle-btn");
inputs = document.querySelectorAll("input");
let i = 0;

function toggleMode(event) {
    let buttonImgPath = event.target.src;
    if (buttonImgPath.includes("dark-mode")) {
        event.target.src = "light-mode.png";
    } else {
        event.target.src = "dark-mode.png";
    }

    let element = document.body;
    element.classList.toggle("light-mode");
}

function isLetter(value) {
    return /[a-zA-Z]/.test(value);
}

function handleKeyStroke(value, id) {
    if (isLetter(value) || value === "Backspace" || value === "Enter") {
        inputs[parseInt(id) + 1].focus();
    } else {
    }
}

function init() {
    toggleButton
        .addEventListener("click", function(event) {
            toggleMode(event);
        });

    inputs.forEach(input => {
        input.addEventListener("keyup", function(event) {
            handleKeyStroke(event.target.value, event.target.id);
        })
    })
}

init();