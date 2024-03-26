toggleButton = document.querySelector(".toggle-btn");
inputs = document.querySelectorAll("input");
inputRows = document.querySelectorAll(".input-row");
keyboardKeys = document.querySelectorAll(".key");
helpIcon = document.querySelector(".help-icon");
howToPlay = document.querySelector(".how-to-play");
loadingDiv = document.querySelector(".spiral");
let done = false;
let rounds = 6;
let secretWord;
let formedWord = "";
let letterBoxes;

function setLoading(isLoading) {
    if (isLoading) {
        loadingDiv.style.display = "block";
    } else if (!isLoading) {
        loadingDiv.style.display = "none";
    }
}

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

    keyboardKeys.forEach(key => {
        key.classList.toggle("key-light-mode");
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
            rounds--;
            checkWord();
            if (!done && rounds <= 0) {
                showLosingAlert();
            }
            if (!done) {
                document.querySelectorAll(`#${nextRow.id} .input-letter`)[0].focus(); // point to next row
            }
        } else if (await validateWord(formedWord) === false) {
            markInvalidWord(letterBoxes);
        }
    }
}

async function validateWord(word) {
    let isLoading = true;
    setLoading(isLoading);
    const promise = await fetch("https://words.dev-apis.com/validate-word", {
        method: "POST",
        body: JSON.stringify({"word": word})
    });
    const response = await promise.json();
    const isValid = response["validWord"];
    isLoading = false;
    setLoading(isLoading);

    return isValid;
}

function checkWord() {
    secretWordLetters = secretWord.split("");
    formedWordLetters = formedWord.split("");
    let occurrences = makeMap(secretWordLetters);
 
    let allRight = 0;
    for (let i = 0; i < 5; i++) {
        if (secretWordLetters[i] === formedWordLetters[i]) {
            keyboardKeys.forEach(key => {
                if (key.innerText === formedWordLetters[i]) {
                    key.classList.add("correct");
                    allRight += 1;
                }
            });
            letterBoxes[i].classList.add("correct");
            occurrences[formedWordLetters[i]]--;
        } else if (occurrences[formedWordLetters[i]] > 0) {
            keyboardKeys.forEach(key => {
                if (key.innerText === formedWordLetters[i]) {
                    key.classList.add("close");
                }
            });
            letterBoxes[i].classList.add("close");
            occurrences[formedWordLetters[i]]--;
        } else if (secretWordLetters[i] !== formedWordLetters[i]) {
            keyboardKeys.forEach(key => {
                if (key.innerText === formedWordLetters[i]) {
                    key.classList.add("wrong");
                }
            });
            letterBoxes[i].classList.add("wrong");
        }
    }

    if (allRight === 5) {
        done = true;
        document.querySelector(".winning-alert")
            .style.display = "block";
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
            if (done) {
                return;
            }

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
            if (done) {
                return;
            }

            if (isLetter(event.target.innerText)) {
                for (let i = 0; i < inputs.length; i++) {
                    if (inputs[i].value.length === 0) {
                        inputs[i].value = event.target.innerText;
                        inputs[i + 1].focus();
                        break;
                    }
                }
            } else if (event.target.innerText === "⌫") {
                loop:
                    for (let i = inputRows.length - 1; i >= 0; i--) {
                        letterBoxes = document.getElementById(inputRows[i].id).getElementsByClassName("input-letter");
                        for (let j = letterBoxes.length - 1; j >= 0; j--) {
                            if (letterBoxes[j].value.length === 1) {
                                letterBoxes[j].value = "";
                                letterBoxes[j].focus();
                                break loop;
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

function showLosingAlert() {
    losingAlert = document.querySelector(".losing-alert");
    losingAlert.style.display = "block";
    wordReveal = document.querySelector(".losing-alert span");
    wordReveal.innerText = "The word was " + secretWord;
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

async function init() {
    let isLoading = true;
    setLoading(isLoading);
    const promise = await fetch("https://words.dev-apis.com/word-of-the-day");
    const response = await promise.json();
    secretWord = response["word"].toUpperCase();
    isLoading = false;
    setLoading(isLoading);

    if (isMobileDevice()) { // disabling input for mobile devices so users can use on-screen keyboard to type
        inputs.forEach(input => {
            input.readOnly = true;
        })
    }

    toggleButton.addEventListener("click", function(event) {
        toggleMode(event);
    });

    helpIcon.addEventListener("click", () => {
        howToPlay.style.display = "block";
    });
     
    inputs[0].focus(); // for focusing on the first input box by default, for user to type in
    
    handleInput();

    handleKeyPress();
}

init();