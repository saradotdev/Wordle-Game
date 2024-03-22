toggleButton = document.querySelector(".toggle-btn");
inputs = document.querySelectorAll("input");
inputRows = document.querySelectorAll(".input-row");
let secretWord;

function toggleMode(event) { // for light and dark themes
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
    if (isLetter(value)) {
        inputs[parseInt(id) + 1].focus();
    }
}

function handleBackspace(id) {
    if (inputs[parseInt(id)].value.length === 0) {
        inputs[parseInt(id) - 1].focus();
    }
}

function handleEnter(id) {
    letterBoxes = document.querySelectorAll(`#${id} .input-letter`);

    let wordFormed = "";
    letterBoxes.forEach(letterBox => {
        if (letterBox.value.length === 1) {
            wordFormed += letterBox.value;
        }
    });

    if (wordFormed.length === 5) {
        if(validateWord(wordFormed)) {
            // 
        }
    }
}

async function validateWord(word) {
    const promise = await fetch("https://words.dev-apis.com/validate-word", {
        method: "POST",
        body: JSON.stringify({"word": word})
    });
    const response = await promise.json();
    const isValid = response["validWord"];
    return isValid;
}

async function init() {
    const promise = await fetch("https://words.dev-apis.com/word-of-the-day");
    const response = await promise.json();
    secretWord = response["word"];

    toggleButton
        .addEventListener("click", function(event) {
            toggleMode(event);
        });
    
    inputs[0].focus(); // for focusing on the first input box by default, for user to type in

    inputs.forEach(input => {
        input.addEventListener("keydown", function(event) {
            if (event.key === "Backspace") {
                handleBackspace(event.target.id);
            } else if (event.key === "Enter") {
                handleEnter(event.target.parentElement.id);
            } else if (isLetter(event.key)) {
                handleKeyStroke(event.target.value, event.target.id); // input letter
            } else {
                event.preventDefault();
            }
        })
    })
}

init();