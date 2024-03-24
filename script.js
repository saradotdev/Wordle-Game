toggleButton = document.querySelector(".toggle-btn");
inputs = document.querySelectorAll("input");
inputRows = document.querySelectorAll(".input-row");
let secretWord;
let formedWord = "";
let letterBoxes;

function toggleMode(event) { // for light and dark themes
    let buttonImgPath = event.target.src;
    if (buttonImgPath.includes("dark-mode")) {
        event.target.src = "light-mode.png";
    } else {
        event.target.src = "dark-mode.png";
    }

    let element = document.body;
    element.classList.toggle("light-mode");
    inputRows.forEach(inputRow => {
        inputRow.classList.toggle("input-row-light-mode");
    })
}

function isLetter(value) {
    return /[a-zA-Z]/.test(value);
}

function handleKeyStroke(value, id, inputRow) {
    letterBoxes = document.querySelectorAll(`#${inputRow.id} .input-letter`);
    if (isLetter(value)) {
        letterBoxes[parseInt(id) + 1].focus();
    }
}

function handleBackspace(id) {
    if (inputs[parseInt(id)].value.length === 0) {
        inputs[parseInt(id) - 1].focus();
    }
}

async function handleEnter(id) {
    letterBoxes = document.querySelectorAll(`#${id} .input-letter`);

    let nextRow; // for getting the next row
    for (let i = 0; i < inputRows.length; i++) {
        if (inputRows[i].id === id) {
            nextRow = inputRows[i + 1];
            break;
        }
    }

    formedWord = "";
    letterBoxes.forEach(letterBox => {
        if (letterBox.value.length === 1) {
            formedWord += letterBox.value;
        }
    });

    if (formedWord.length === 5) {
        if (await validateWord(formedWord) === true) {
            checkWord();
            document.querySelectorAll(`#${nextRow.id} .input-letter`)[0].focus(); // point to next row
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

function checkWord() {
    secretWordLetters = secretWord.split("");
    formedWordLetters = formedWord.split("");
    makeMap(secretWordLetters);

    for (let i = 0; i < secretWordLetters.length; i++) {
        if (secretWordLetters[i] === formedWordLetters[i]) {
            letterBoxes[i].classList.add("correct");
        } else if (secretWordLetters.includes(formedWordLetters[i])) {
            letterBoxes[i].classList.add("close");
        } else if (secretWordLetters[i] !== formedWordLetters[i]) {
            letterBoxes[i].classList.add("wrong");
        }
    }
}

function makeMap(array) {
    console.log(array);
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
                handleKeyStroke(event.target.value, event.target.id, event.target.parentElement);
            } else {
                event.preventDefault();
            }
        })
    })
}

init();