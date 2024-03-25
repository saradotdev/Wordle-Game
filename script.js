toggleButton = document.querySelector(".toggle-btn");
inputs = document.querySelectorAll("input");
inputRows = document.querySelectorAll(".input-row");
keyboardKeys = document.querySelectorAll(".keyboard-row button");
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
    return /^[a-zA-Z]$/.test(value);
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

    formedWord = "";
    letterBoxes.forEach(letterBox => {
        if (letterBox.value.length === 1) {
            formedWord += letterBox.value.toUpperCase();
        }
    });

    let nextRow; // for getting the next row
    for (let i = 0; i < inputRows.length; i++) {
        if (inputRows[i].id === id) {
            nextRow = inputRows[i + 1];
            break;
        }
    }

    if (formedWord.length === 5) {
        if (await validateWord(formedWord) === true) {
            checkWord();
            document.querySelectorAll(`#${nextRow.id} .input-letter`)[0].focus(); // point to next row
        } else if (await validateWord(formedWord) === false) {
            markInvalidWord(letterBoxes);
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
    let occurrences = makeMap(secretWordLetters);

    for (let i = 0; i < 5; i++) {
        if (secretWordLetters[i] === formedWordLetters[i]) {
            letterBoxes[i].classList.add("correct");
            occurrences[formedWordLetters[i]]--;
        } else if (occurrences[formedWordLetters[i]] > 0) {
            letterBoxes[i].classList.add("close");
            occurrences[formedWordLetters[i]]--;
        } else if (secretWordLetters[i] !== formedWordLetters[i]) {
            letterBoxes[i].classList.add("wrong");
        }
    }
}

function makeMap(array) {
    let obj = {};
    for (let i = 0; i < array.length; i++) {
        if (obj[array[i]]) {
            obj[array[i]] += 1;
        } else {
            obj[array[i]] = 1;
        }
    }
    return obj;
}

function markInvalidWord(boxes) {
    boxes.forEach(box => {
        box.classList.remove("invalid");
    });

    // long enough for the browser to repaint without the "invalid class" so we can then add it again
    // setTimeout takes a function and time
    setTimeout(() => {
        boxes.forEach(box => {
            box.classList.add("invalid");
        })
    }, 10);
}

function handleInput() {
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
        });
    });
}

function handleKeyPress() {
    keyboardKeys.forEach(key => {
        key.addEventListener("click", function(event) {
            if (isLetter(event.target.innerText)) {
                for (let i = 0; i < inputs.length; i++) {
                    if (inputs[i].value.length === 0) {
                        inputs[i].value = event.target.innerText;
                        inputs[i + 1].focus();
                        break;
                    }
                }
            } else if (event.target.innerText === "⌫") { // ERROR HERE
                for (let i = inputRows.length - 1; i >= 0; i--) {
                    letterBoxes = document.getElementById(inputRows[i].id).getElementsByClassName("input-letter");
                    // letterBoxes = document.querySelectorAll(`#${inputRows[i].id} .input-letter`);
                    for (let i = letterBoxes.length - 1; i >= 0; i--) {
                        if (letterBoxes[i].value.length === 1) {
                            letterBoxes[i].value = "";
                            break;
                        }
                    }
                }
            } else if (event.target.innerText === "ENTER") {
                for (let i = inputRows.length - 1; i >= 0; i--) {
                    letterBoxes = document.querySelectorAll(`#${inputRows[i].id} .input-letter`);
                    
                    let arr = []
                    letterBoxes.forEach(letterBox => {
                        if (letterBox.value.length === 1) {
                            arr.push("true");
                        }
                    })
                    
                    if (arr.length === 5) {
                        handleEnter(inputRows[i].id);
                        break;
                    }
                } 
            }
        });
    });
}

async function init() {
    const promise = await fetch("https://words.dev-apis.com/word-of-the-day");
    const response = await promise.json();
    secretWord = response["word"].toUpperCase();

    toggleButton
        .addEventListener("click", function(event) {
            toggleMode(event);
        });
    
    inputs[0].focus(); // for focusing on the first input box by default, for user to type in

    handleInput();

    handleKeyPress();
}

init();