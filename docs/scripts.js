import { words } from "/data/words.js";
const wordCount = words.length;

let wIndex = 0;
let lIndex = 1;
let cursorIndex = 0;
let cursorRight = 0;
let prefixWordSizes = [];
let wordSizes = [];
let allLetters = Array.from([]);
let allWords = [];
let lettersInWord = 0;
let cursorTimeout;
let timerNum = 15;
let wordNum = 10;
let timerOn = 0;
const timeButton = document.getElementById("time-button");
document.onkeydown = function (key) {
  let letter = allLetters[lIndex];
  let cursor = document.getElementById("cursor");
  const letterRect = letter.getBoundingClientRect();
  if (key.key == " ") key.preventDefault();
  if (key.key == "Tab") {
    //quick reset
    key.preventDefault();
    newGame();
  } else if (key.key == "Alt") {
    key.preventDefault();
  } else if (key.key == "Backspace") {
    //backspace
    lettersInWord--;
    cursor.classList.add("no-blink");
    lIndex = Math.max(lIndex - 1, 0);
    if (allLetters[lIndex].classList.contains("extra")) {
      allLetters[lIndex].remove();
      allLetters.splice(lIndex, 1);
    }
    cursorIndex--;
    letter = allLetters[lIndex];
    letter.classList.remove("correct");
    letter.classList.remove("incorrect");
    if (lIndex == prefixWordSizes[wIndex - 1] - 1) {
      allWords[wIndex - 1].style.textDecoration = "none";
      wIndex--;
    }
  } else if (key.key.length == 1 && key.key != " ") {
    //letter
    if (lIndex == allLetters.length - 1) {
      newGame(); //make it go to stats screen instead
      return;
    }
    if (timerOn == 0 && timeButton.classList.contains("active")) {
      startCountdown(timerNum);
      console.log(timerNum);
      timerOn = 1;
    }
    if (Math.max(lettersInWord - wordSizes[wIndex], 0) == 18) {
      return;
    }
    //move cursor
    if (lettersInWord + 1 == wordSizes[wIndex]) {
      cursorRight = 1;
    } else if (lettersInWord + 1 > wordSizes[wIndex]) {
      cursorIndex++;
      cursorRight = 1;
    } else {
      cursorIndex++;
      cursorRight = 0;
    }

    lettersInWord++;
    cursor.classList.add("no-blink");
    //----------------- there is a problem here -----------------------
    if (lettersInWord > wordSizes[wIndex]) {
      //extra letter
      let textArea = document.getElementById("words");
      let newSpan = document.createElement("span");
      newSpan.classList.add("incorrect");
      newSpan.classList.add("incorrect", "extra");
      newSpan.textContent = key.key;

      allWords[wIndex].appendChild(newSpan);
      allLetters.splice(lIndex, 0, newSpan);
    } else if (letter.textContent == key.key) {
      letter.classList.add("correct");
      letter.classList.remove("incorrect");
    } else {
      letter.classList.add("incorrect");
      letter.classList.remove("correct");
    }
    //deciding where the first letter of the next word is
    let extraLetters = Math.max(lettersInWord - wordSizes[wIndex], 0);
    if (wIndex > 0)
      prefixWordSizes[wIndex] = prefixWordSizes[wIndex - 1] + wordSizes[wIndex];
    else prefixWordSizes[wIndex] = wordSizes[0];
    prefixWordSizes[wIndex] += extraLetters;

    lIndex++;
  } else if (
    key.key == " " &&
    lIndex != 0 &&
    lIndex != prefixWordSizes[wIndex - 1]
  ) {
    //space
    cursor.classList.add("no-blink");
    if (wIndex == allWords.length - 1) {
      newGame(); //make it go to stats screen instead
      return;
    }
    cursorRight = 0;
    allWords[wIndex].style.textDecoration = "underline";
    lIndex = prefixWordSizes[wIndex];
    cursorIndex = lIndex;
    lettersInWord = 0;
    wIndex++;
  }
  clearTimeout(cursorTimeout);
  cursorTimeout = setTimeout(() => {
    cursor.classList.remove("no-blink");
  }, 1000);
};
//----------------------------- there is a problem above ----------------------
function formatWord(word) {
  return `<div class="word">
    <span class="letter">${word
      .split("")
      .join('</span><span class="letter">')}</span>
    </div>`;
}

function randomWord() {
  const randInd = Math.ceil(Math.random() * wordCount - 1);
  return words[randInd];
}

function renderWords(wordNum) {
  let wordSpan = document.getElementById("words");
  for (let i = 0; i < wordNum; i++) {
    let chosenWord;
    if (numbers.classList.contains("active") && Math.random() < 0.1) {
      chosenWord = String(Math.floor(Math.random() * 1000));
    } else {
      chosenWord = randomWord();
    }
    if (punctuation.classList.contains("active")) {
      const suffix = [",", ".", "?", "!", ";", ":"];
      if (Math.random() < 0.3) {
        chosenWord += suffix[Math.floor(Math.random() * suffix.length)];
      }
    }
    wordSizes[i] = chosenWord.length;
    wordSpan.innerHTML += formatWord(chosenWord);
  }
}

function newGame() {
  wordsAnimation();
  resetCountdown();

  cursorIndex = 0;
  cursorRight = 0;
  lettersInWord = 0;
  lIndex = 0;
  wIndex = 0;

  // Clearing previous words
  let wordSpan = document.getElementById("words");
  wordSpan.innerHTML = "";

  // Rendering new words
  renderWords(currentWordsCount);

  allLetters = Array.from(wordSpan.querySelectorAll("span"));
  allWords = wordSpan.querySelectorAll("div");

  // Adding cursor
  let cursor = document.getElementById("cursor");
  if (!cursor) {
    cursor = document.createElement("section");
    cursor.id = "cursor";
    wordSpan.appendChild(cursor);
  }
  moveCursor();
}

function moveCursor() {
  // console.log(cursorIndex);
  let cursor = document.getElementById("cursor");
  cursor.hidden = false;
  let letter = allLetters[cursorIndex];

  if (!letter) return; // Avoid errors if `lIndex` is out of range

  const letterRect = letter.getBoundingClientRect();
  const wordsRect = document.getElementById("words").getBoundingClientRect();

  // Calculate position relative to #words
  const offsetLeft = letterRect.left - wordsRect.left;
  const offsetTop = letterRect.top - wordsRect.top;
  let prevLetter = allLetters[cursorIndex];
  let prevLetterRect = prevLetter.getBoundingClientRect();
  let offsetRight = prevLetterRect.right - wordsRect.left;

  // Update cursor size and position
  cursor.style.height = `${letterRect.height}px`;
  cursor.style.top = `${offsetTop}px`;

  if (cursorRight) {
    cursor.style.left = `${offsetRight}px`;
  } else cursor.style.left = `${offsetLeft - 1}px`;
}

let lastZoom = window.devicePixelRatio;
window.addEventListener("resize", () => {
  if (window.devicePixelRatio !== lastZoom) {
    lastZoom = window.devicePixelRatio;
    let cursor = document.getElementById("cursor");
    cursor.hidden = true;
  }
});

function wordsAnimation() {
  let typingLines = document.getElementById("words");
  typingLines.classList.add("fade");
  setTimeout(() => {
    typingLines.classList.remove("fade");
  }, 500);
}

const reset = (document.getElementById("reset-button").onclick = newGame);
const resetButton = document.getElementById("reset-button");
resetButton.addEventListener("click", () => {
  resetButton.classList.add("rotate-animation");

  setTimeout(() => {
    resetButton.classList.remove("rotate-animation");
  }, 500);
});

function resetActiveButtons(buttonGroup) {
  buttonGroup.forEach((button) => button.classList.remove("active"));
}
let currentTimerValue = timerNum;
let countdownInterval;
function startCountdown(value) {
  clearInterval(countdownInterval);
  currentTimerValue = value;
  timerElement.textContent = `${currentTimerValue}s`;

  countdownInterval = setInterval(() => {
    if (currentTimerValue == 0) newGame(); // stats screen TODO
    if (currentTimerValue > 0) {
      currentTimerValue--;
      timerElement.textContent = `${currentTimerValue}s`;
    } else {
      clearInterval(countdownInterval);
    }
  }, 1000);
}
function resetCountdown() {
  timerOn = 0;
  clearInterval(countdownInterval);
  timerElement.textContent = `${timerNum}s`;
}
function isTimeButtonActive() {
  return timeButton.classList.contains("active");
}

//words and time
const btn1 = document.querySelector(".btn1");
const btn2 = document.querySelector(".btn2");
const btn3 = document.querySelector(".btn3");
const btn4 = document.querySelector(".btn4");
const timerElement = document.querySelector(".timernum");

const wordsButton = document.getElementById("words-button");
let timer = document.getElementById("timer");
let currentWordsCount = 10;
let lastTimeSetting = btn1;
let lastWordSetting = btn1;

function isWordsButtonActive() {
  return wordsButton.classList.contains("active");
}

function activateButton(activeButton, inactiveButton) {
  activeButton.classList.add("active");
  inactiveButton.classList.remove("active");
}

window.addEventListener("load", () => {
  //when loading page
  activateButton(timeButton, wordsButton);
  btn1.classList.add("active");
  timerNum = 15;
  timerElement.textContent = "15s";
  btn1.textContent = "15";
  btn2.textContent = "30";
  btn3.textContent = "60";
  btn4.textContent = "120";
});

timeButton.addEventListener("click", () => {
  //when time button is pressed
  newGame();
  activateButton(timeButton, wordsButton);
  timer.classList.remove("hidden");
  // Reset words buttons and activate default time button
  resetActiveButtons([btn1, btn2, btn3, btn4]);
  lastTimeSetting.classList.add("active");
  btn1.textContent = "15";
  btn2.textContent = "30";
  btn3.textContent = "60";
  btn4.textContent = "120";
});

wordsButton.addEventListener("click", () => {
  // when words button is pressed
  newGame();
  timer.classList.add("hidden"); // hide timer
  resetActiveButtons([btn1, btn2, btn3, btn4]);
  lastWordSetting.classList.add("active");
  activateButton(wordsButton, timeButton);

  btn1.textContent = "10";
  btn2.textContent = "25";
  btn3.textContent = "50";
  btn4.textContent = "100";
});

btn1.addEventListener("click", () => {
  if (isWordsButtonActive()) {
    resetActiveButtons([btn1, btn2, btn3, btn4]);
    btn1.classList.add("active");
    lastWordSetting = btn1;
    currentWordsCount = 10;
  } else {
    resetActiveButtons([btn1, btn2, btn3, btn4]);
    btn1.classList.add("active");
    timerElement.textContent = "15s";
    timerNum = 15;
  }
  newGame();
});

btn2.addEventListener("click", () => {
  resetActiveButtons([btn1, btn2, btn3, btn4]);
  btn2.classList.add("active");
  if (isWordsButtonActive()) {
    lastWordSetting = btn2;
    currentWordsCount = 25;
  } else {
    lastTimeSetting = btn2;
    timerNum = 30;
    timerElement.textContent = "30s";
  }
  newGame();
});

btn3.addEventListener("click", () => {
  resetActiveButtons([btn1, btn2, btn3, btn4]);
  btn3.classList.add("active");
  if (isWordsButtonActive()) {
    lastWordSetting = btn3;
    currentWordsCount = 50;
  } else {
    lastTimeSetting = btn3;
    timerNum = 60;
    timerElement.textContent = "60s";
  }
  newGame();
});

btn4.addEventListener("click", () => {
  resetActiveButtons([btn1, btn2, btn3, btn4]);
  btn4.classList.add("active");
  if (isWordsButtonActive()) {
    lastWordSetting = btn4;
    currentWordsCount = 100;
  } else {
    lastTimeSetting = btn2;
    timerNum = 120;
    timerElement.textContent = "120s";
  }
  newGame();
});

const numbers = document.getElementById("numbers");
const punctuation = document.getElementById("punctuation");
numbers.addEventListener("click", () => {
  numbers.classList.toggle("active");
  newGame();
});
punctuation.addEventListener("click", () => {
  punctuation.classList.toggle("active");
  newGame();
});

setInterval(moveCursor, 0);
newGame();
