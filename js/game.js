// Main Game Logic - Refactored and Clean
// This file contains only the unique game logic, importing everything else from modules

// Import modules
import { allSublevels, completedSublevels } from './data/levelData.js';
import { challengeSublevels, completedChallenges } from './data/challengeData.js';
import { tutorialQuestions } from './data/tutorialData.js';
import {
  loadLearningProgress,
  saveLearningProgress,
  loadChallengeProgress,
  saveChallengeProgress,
  loadBestEndlessStreak,
  saveBestEndlessStreak,
  loadBestTime,
  saveBestTime
} from './data/progress.js';
import { getShell, playSound } from './utils/helpers.js';
import {
  loadAchievements,
  unlockAchievement,
  unlockAchievements,
  updateAchievementsDisplay
} from './achievements/achievementSystem.js';
import { applyDarkMode, attachDarkModeToggle } from './ui/darkMode.js';
import { state } from './state/gameState.js';

// Sounds
const correctSound = new Audio('correct-sound.mp3');
correctSound.load();
const achievementSound = new Audio('achievement-sound.mp3');
achievementSound.load();

function playCorrectSound() {
  playSound(correctSound);
}

// Global variables for mode state
let currentMode = "";
let currentLevel = '';
let currentSubLevel = '';
let currentChallenge = '';
let currentExpression = '';
let tutorialIndex = 0;
let challengeIndex = 0;
let currentIndex = 0;
let endlessStreak = 0;

// Tutorial tip state
let tutorialMultiplicationTipShown = false;
let tutorialFractionTipShown = false;

// Timer state
let challengeTimerInterval = null;
let challengeTimerSeconds = 0;

// ==================================================
// Utility Functions
// ==================================================

function normalizeInput(input) {
  return input
    .replace(/\\mathrm\{([^}]+)\}/g, '$1')
    .replace(/\s+/g, '')
    .replace(/\\left/g, '')
    .replace(/\\right/g, '')
    .replace(/\\,/g, '')
    .replace(/~/g, ' ');
}

function allSublevelsCompleted() {
  return Object.values(completedSublevels).every(level =>
    Object.values(level).every(sublevel => sublevel)
  );
}

// ==================================================
// Tutorial Tips
// ==================================================

function positionTutorialTip() {
  const inputField = document.getElementById("inputField");
  const tutorialTip = document.getElementById("tutorialTip");
  if (inputField && tutorialTip) {
    const rect = inputField.getBoundingClientRect();
    const tipWidth = tutorialTip.offsetWidth;
    tutorialTip.style.left = (rect.left - tipWidth - 20 + window.scrollX) + "px";
    tutorialTip.style.top = (rect.top + window.scrollY + rect.height / 2 - 150) + "px";
  }
}

function updateTutorialTip() {
  const tipElem = document.getElementById("tutorialTip");
  if (!tipElem) return;

  if (tutorialIndex === 0) {
    tipElem.innerText = "LaTeX is a language that lets you write complex math symbols. This one is easy though—these symbols are on your keyboard. Just type them in!";
    tipElem.style.display = "block";
  } else if (tutorialIndex === 1) {
    tipElem.innerText = "The multiplication symbol isn't on your keyboard, so use the special syntax. Hover over the symbol in the question to see the syntax for it.";
    tipElem.style.display = "block";
  } else if (tutorialIndex === 2) {
    tipElem.innerText = "Fractions are trickier. Hover to see the syntax! When you see curly brackets { }, we usually type inside them.";
    tipElem.style.display = "block";
  } else if (tutorialIndex === 3) {
    tipElem.innerText = "Really stuck? Click 'Show Guide' to see the syntax for the question so you can type along!";
    tipElem.style.display = "block";
  } else {
    tipElem.style.display = "none";
  }

  positionTutorialTip();
  tipElem.classList.add("animate-tip");
  setTimeout(() => { tipElem.classList.remove("animate-tip"); }, 600);
}

window.addEventListener("resize", positionTutorialTip);

// ==================================================
// UI Feedback Functions
// ==================================================

function flashElement(element, color) {
  const originalBg = element.style.backgroundColor;
  const originalTransition = element.style.transition;
  element.style.transition = "background-color 0.3s";
  element.style.backgroundColor = color;
  setTimeout(() => {
    element.style.backgroundColor = originalBg;
    setTimeout(() => {
      element.style.transition = originalTransition;
    }, 300);
  }, 300);
}

function triggerConfetti() {
  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
}

function shakeElement(element) {
  element.classList.add("shake");
  setTimeout(() => { element.classList.remove("shake"); }, 500);
}

function showTimerPopup(message) {
  const popup = document.createElement("div");
  popup.className = "info-popup";
  popup.innerText = message;
  popup.style.opacity = "1";
  document.body.appendChild(popup);
  setTimeout(() => { popup.style.opacity = "0"; }, 6000);
  setTimeout(() => { popup.remove(); }, 7000);
}

function resetInputAndPreview() {
  const inputField = document.getElementById("inputField");
  if (inputField) {
    inputField.value = "";
    inputField.setAttribute("placeholder", "Type LaTeX syntax here...");
  }
  const preview = document.getElementById("preview");
  if (preview) preview.innerHTML = "";
}

// ==================================================
// Progress Display Functions
// ==================================================

function updateProgress() {
  const progressText = document.getElementById("progress-text");
  const progressBar = document.getElementById("progress-bar");

  if (currentMode === "tutorial") {
    progressText.innerText = `Question ${tutorialIndex + 1} of ${tutorialQuestions.length}`;
    const percentage = ((tutorialIndex + 1) / tutorialQuestions.length) * 100;
    progressBar.style.width = percentage + "%";
  } else if (currentMode === "challenge") {
    const questions = challengeSublevels[currentChallenge];
    progressText.innerText = `Question ${challengeIndex + 1} of ${questions.length}`;
    const percentage = ((challengeIndex + 1) / questions.length) * 100;
    progressBar.style.width = percentage + "%";
  } else if (currentMode === "learning" && currentSubLevel) {
    const questions = allSublevels[currentLevel][currentSubLevel];
    progressText.innerText = `Question ${currentIndex + 1} of ${questions.length}`;
    const percentage = ((currentIndex + 1) / questions.length) * 100;
    progressBar.style.width = percentage + "%";
  } else if (currentMode === "endless") {
    progressText.innerText = `Current Streak: ${endlessStreak}`;
    progressBar.style.width = "100%";
  }
}

function updateCurrentStreakDisplay() {
  const display = document.getElementById("longestStreakDisplay");
  if (display) {
    display.textContent = loadBestEndlessStreak();
  }
}

// ==================================================
// Continuation in next part...
// This file is getting long. Would you like me to:
// 1. Continue with the full consolidated file
// 2. Split into more focused modules
// 3. Or just clean up legacy.js by removing duplicates?
// ==================================================

export {
  currentMode,
  currentLevel,
  currentSubLevel,
  playCorrectSound,
  normalizeInput,
  updateProgress,
  triggerConfetti,
  flashElement,
  shakeElement
};
