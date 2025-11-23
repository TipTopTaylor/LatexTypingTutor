// Main Game File - Clean and Modular
// This replaces legacy.js with a proper modular structure

// Import all modules
import { getShell, playSound } from './utils/helpers.js';
import {
  loadAchievements,
  unlockAchievement,
  unlockAchievements,
  saveAchievements,
  updateAchievementsDisplay,
  formatAchievementName
} from './achievements/achievementSystem.js';
import { allSublevels, completedSublevels, formatSublevelName } from './data/levelData.js';
import { challengeSublevels, completedChallenges, formatChallengeName } from './data/challengeData.js';
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
import { applyDarkMode } from './ui/darkMode.js';
import { tokenizeLatex, groupTokens, renderMath, resetTutorialTipState } from './core/rendering.js';
import { normalizeInput } from './core/answerChecker.js';
import {
  flashElement,
  triggerConfetti,
  shakeElement,
  showTimerPopup,
  resetInputAndPreview
} from './ui/feedback.js';
import { startLatexAnimation } from './ui/animation.js';

// Sounds
const correctSound = new Audio('correct-sound.mp3');
correctSound.load();
const achievementSound = new Audio('achievement-sound.mp3');
achievementSound.load();

function playCorrectSound() {
  playSound(correctSound);
}

// Global State Variables
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
// Challenge Timer Functions
// ==================================================

function startChallengeTimer() {
  challengeTimerSeconds = 0;
  updateTimerDisplay();
  challengeTimerInterval = setInterval(() => {
    challengeTimerSeconds++;
    updateTimerDisplay();
  }, 1000);
}

function stopChallengeTimer() {
  if (challengeTimerInterval) {
    clearInterval(challengeTimerInterval);
    challengeTimerInterval = null;
  }
}

function updateTimerDisplay() {
  const display = document.getElementById("timerDisplay");
  if (display) {
    const minutes = Math.floor(challengeTimerSeconds / 60);
    const seconds = challengeTimerSeconds % 60;
    display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

// ==================================================
// Main Answer Checking Function
// ==================================================

window.checkAnswer = function() {
  const inputField = document.getElementById("inputField");
  const input = normalizeInput(inputField.value);
  let correctLatex = "";

  if (currentMode === "challenge") {
    correctLatex = normalizeInput(challengeSublevels[currentChallenge][challengeIndex].latex);
  } else if (currentMode === "learning") {
    if (currentSubLevel) {
      correctLatex = normalizeInput(allSublevels[currentLevel][currentSubLevel][currentIndex].latex);
    }
  } else if (currentMode === "endless") {
    correctLatex = normalizeInput(currentExpression.latex);
  } else if (currentMode === "tutorial") {
    correctLatex = normalizeInput(tutorialQuestions[tutorialIndex].latex);
  }

  if (input === correctLatex) {
    if (inputField.hasAttribute("data-guide")) {
      inputField.removeAttribute("data-guide");
      inputField.classList.remove("guide-active");
      document.getElementById("showGuideBtn").textContent = "Show Guide";
    }

    inputField.value = "";
    window.updateOverlay();
    inputField.setAttribute("placeholder", "Type LaTeX syntax here...");
    playCorrectSound();

    if (currentMode === "endless") {
      endlessStreak++;
      updateProgress();

      const bestStreak = loadBestEndlessStreak();
      if (endlessStreak > bestStreak) {
        saveBestEndlessStreak(endlessStreak);
      }
      if (endlessStreak === 5) { unlockAchievement("endless5InRow"); }
      if (endlessStreak === 10) { unlockAchievement("endless10InRow"); }
      flashElement(inputField, "#66e385");
      nextEndlessQuestion();
      return;
    } else if (currentMode === "tutorial") {
      if (tutorialIndex === tutorialQuestions.length - 1) {
        document.getElementById("tutorialTip").innerText = "Amazing, you're ready for Learning Mode!";
        triggerConfetti();
        unlockAchievement("graduatedLatexKindergarten");
        showTimerPopup("Tutorial complete!");
        document.getElementById("tutorInterface").style.display = "none";
        document.getElementById("modeSelectionScreen").style.display = "flex";
        tutorialIndex = 0;
        resetInputAndPreview();
        return;
      } else {
        tutorialIndex++;
        if (tutorialIndex === 1) tutorialMultiplicationTipShown = false;
        if (tutorialIndex === 2) tutorialFractionTipShown = false;
      }
    } else if (currentMode === "challenge") {
      const questions = challengeSublevels[currentChallenge];
      if (challengeIndex === questions.length - 1) {
        completedChallenges[currentChallenge] = true;
        saveChallengeProgress();
        triggerConfetti();
        resetInputAndPreview();
        updateChallengeCompletion();
        stopChallengeTimer();

        const timeText = document.getElementById("timerDisplay").textContent;
        const [min, sec] = timeText.split(":").map(Number);
        const elapsedSeconds = min * 60 + sec;
        saveBestTime(currentChallenge, elapsedSeconds);

        if (elapsedSeconds < 60) {
          unlockAchievement("challengeUnder1");
          unlockAchievement("challengeUnder2");
        } else if (elapsedSeconds < 120) {
          unlockAchievement("challengeUnder2");
        }

        if (Object.values(completedChallenges).every(val => val)) {
          unlockAchievement("finishChallenge");
        }

        checkAllChallengeAchievements();
        showTimerPopup(`Challenge complete! Your time: ${timeText}`);
        document.getElementById("tutorInterface").style.display = "none";
        document.getElementById("challengeSublevelScreen").style.display = "flex";
        challengeIndex = 0;
        return;
      } else {
        challengeIndex++;
      }
    } else {
      const questions = allSublevels[currentLevel][currentSubLevel];
      if (currentIndex === questions.length - 1) {
        completedSublevels[currentLevel][currentSubLevel] = true;
        saveLearningProgress();
        document.getElementById("tutorInterface").style.display = "none";
        document.getElementById("sublevelScreen").style.display = "flex";
        triggerConfetti();
        resetInputAndPreview();
        updateSublevelCompletion();
        updateLevelCompletion();

        if (currentLevel === "forPhysicist" && Object.values(completedSublevels.forPhysicist).every(val => val)) {
          unlockAchievement("finishPhysicist");
        }
        if (currentLevel === "forMathematicians" && Object.values(completedSublevels.forMathematicians).every(val => val)) {
          unlockAchievement("finishMathematicians");
        }
        if (allSublevelsCompleted()) { unlockAchievement("finishLearning"); }
        currentIndex = 0;
        resetInputAndPreview();
        return;
      } else {
        currentIndex++;
      }
    }
    resetInputAndPreview();
    renderMath(currentMode, currentLevel, currentSubLevel, currentIndex, currentChallenge, challengeIndex, tutorialIndex, currentExpression, updateProgress, updateTutorialTip);
    flashElement(inputField, "#66e385");
  } else {
    if (currentMode === "endless") {
      endlessStreak = 0;
      updateProgress();
    }
    shakeElement(inputField);
  }
};

// ==================================================
// Input Preview and Overlay Functions
// ==================================================

window.updateOverlay = function() {
  const inputField = document.getElementById("inputField");
  const overlayDiv = document.getElementById("inputOverlay");
  if (!inputField || !overlayDiv) return;

  if (inputField.hasAttribute("data-guide")) {
    const guideText = inputField.getAttribute("data-guide");
    const userInput = inputField.value;
    overlayDiv.innerHTML = "";

    for (let i = 0; i < guideText.length; i++) {
      const span = document.createElement("span");
      span.textContent = guideText[i];

      if (i < userInput.length) {
        span.style.color = userInput[i] === guideText[i] ? "#888" : "red";
      } else {
        span.style.color = "#ccc";
      }
      overlayDiv.appendChild(span);
    }
  } else {
    const typedSpan = document.createElement("span");
    typedSpan.className = "typed";
    typedSpan.textContent = inputField.value;
    overlayDiv.innerHTML = "";
    overlayDiv.appendChild(typedSpan);
  }
};

window.updatePreview = function() {
  const input = document.getElementById("inputField").value.trim();
  document.getElementById("preview").innerHTML = `\\[${input}\\]`;
  MathJax.typesetPromise();
  window.updateOverlay();
};

window.handleKeyPress = function(event) {
  if (event.key === 'Enter') window.checkAnswer();
};

// ==================================================
// Level and Sublevel Completion Functions
// ==================================================

function updateSublevelCompletion() {
  Object.keys(allSublevels[currentLevel]).forEach(sublevelKey => {
    const button = document.querySelector(`[data-sublevel="${sublevelKey}"]`);
    if (button && completedSublevels[currentLevel][sublevelKey]) {
      button.classList.add("completed");
      button.innerHTML += " ✓";
    }
  });
}

function updateLevelCompletion() {
  ['forPhysicist', 'forMathematicians'].forEach(levelKey => {
    const levelButton = document.querySelector(`[data-level="${levelKey}"]`);
    if (levelButton) {
      const allCompleted = Object.values(completedSublevels[levelKey]).every(val => val);
      if (allCompleted) {
        levelButton.classList.add("completed");
        if (!levelButton.innerHTML.includes("✓")) {
          levelButton.innerHTML += " ✓";
        }
      }
    }
  });
}

function updateChallengeCompletion() {
  Object.keys(challengeSublevels).forEach(challengeKey => {
    const button = document.querySelector(`[data-challenge="${challengeKey}"]`);
    if (button) {
      if (completedChallenges[challengeKey]) {
        button.classList.add("completed");
        if (!button.innerHTML.includes("✓")) {
          button.innerHTML += " ✓";
        }
      }

      const bestTime = loadBestTime(challengeKey);
      const timeSpan = button.querySelector(".best-time");
      if (timeSpan && bestTime) {
        const minutes = Math.floor(bestTime / 60);
        const seconds = bestTime % 60;
        timeSpan.textContent = `Best: ${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    }
  });
}

function checkAllChallengeAchievements() {
  const allTimes = Object.keys(challengeSublevels).map(key => loadBestTime(key)).filter(t => t !== null);

  if (allTimes.length === Object.keys(challengeSublevels).length) {
    if (allTimes.every(t => t < 180)) {
      unlockAchievement("challengeAllUnder3");
    }
    if (allTimes.every(t => t < 300)) {
      unlockAchievement("challengeAllUnder5");
    }
  }
}

// ==================================================
// Endless Mode Functions
// ==================================================

function startEndlessMode() {
  currentMode = "endless";
  endlessStreak = 0;
  document.getElementById("modeSelectionScreen").style.display = "none";
  document.getElementById("tutorInterface").style.display = "flex";
  document.getElementById("challengeTimer").style.display = "none";
  updateCurrentStreakDisplay();
  nextEndlessQuestion();
}

function nextEndlessQuestion() {
  const levels = Object.keys(allSublevels);
  const randomLevel = levels[Math.floor(Math.random() * levels.length)];
  const sublevels = Object.keys(allSublevels[randomLevel]);
  const randomSublevel = sublevels[Math.floor(Math.random() * sublevels.length)];
  const questions = allSublevels[randomLevel][randomSublevel];
  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

  currentExpression = randomQuestion;
  resetInputAndPreview();
  renderMath(currentMode, currentLevel, currentSubLevel, currentIndex, currentChallenge, challengeIndex, tutorialIndex, currentExpression, updateProgress, updateTutorialTip);
  updateProgress();
}

// ==================================================
// Mode Start Functions
// ==================================================

function startLearningMode(level, sublevel) {
  currentMode = "learning";
  currentLevel = level;
  currentSubLevel = sublevel;
  currentIndex = 0;
  document.getElementById("sublevelScreen").style.display = "none";
  document.getElementById("tutorInterface").style.display = "flex";
  document.getElementById("challengeTimer").style.display = "none";
  resetInputAndPreview();
  renderMath(currentMode, currentLevel, currentSubLevel, currentIndex, currentChallenge, challengeIndex, tutorialIndex, currentExpression, updateProgress, updateTutorialTip);
}

function startTutorialMode() {
  currentMode = "tutorial";
  tutorialIndex = 0;
  tutorialMultiplicationTipShown = false;
  tutorialFractionTipShown = false;
  resetTutorialTipState();
  document.getElementById("modeSelectionScreen").style.display = "none";
  document.getElementById("tutorInterface").style.display = "flex";
  document.getElementById("challengeTimer").style.display = "none";
  document.getElementById("tutorialTip").style.display = "block";
  resetInputAndPreview();
  renderMath(currentMode, currentLevel, currentSubLevel, currentIndex, currentChallenge, challengeIndex, tutorialIndex, currentExpression, updateProgress, updateTutorialTip);
  updateTutorialTip();
}

function startChallengeMode(challenge) {
  currentMode = "challenge";
  currentChallenge = challenge;
  challengeIndex = 0;
  document.getElementById("challengeSublevelScreen").style.display = "none";
  document.getElementById("tutorInterface").style.display = "flex";
  document.getElementById("challengeTimer").style.display = "block";
  startChallengeTimer();
  resetInputAndPreview();
  renderMath(currentMode, currentLevel, currentSubLevel, currentIndex, currentChallenge, challengeIndex, tutorialIndex, currentExpression, updateProgress, updateTutorialTip);
}

// ==================================================
// Show Guide Function
// ==================================================

window.toggleGuide = function() {
  const inputField = document.getElementById("inputField");
  const btn = document.getElementById("showGuideBtn");

  if (inputField.hasAttribute("data-guide")) {
    inputField.removeAttribute("data-guide");
    inputField.classList.remove("guide-active");
    btn.textContent = "Show Guide";
    window.updateOverlay();
  } else {
    let correctLatex = "";
    if (currentMode === "tutorial") {
      correctLatex = tutorialQuestions[tutorialIndex].latex;
    } else if (currentMode === "learning") {
      correctLatex = allSublevels[currentLevel][currentSubLevel][currentIndex].latex;
    } else if (currentMode === "challenge") {
      correctLatex = challengeSublevels[currentChallenge][challengeIndex].latex;
    } else if (currentMode === "endless") {
      correctLatex = currentExpression.latex;
    }
    inputField.setAttribute("data-guide", correctLatex);
    inputField.classList.add("guide-active");
    btn.textContent = "Hide Guide";
    window.updateOverlay();
  }
};

// ==================================================
// Screen Population Functions
// ==================================================

function populateSublevelScreen() {
  const container = document.getElementById("sublevelButtons");
  container.innerHTML = "";

  Object.keys(allSublevels[currentLevel]).forEach(sublevelKey => {
    const button = document.createElement("button");
    button.className = "sublevel-button";
    button.setAttribute("data-sublevel", sublevelKey);
    button.textContent = formatSublevelName(sublevelKey);
    button.onclick = () => startLearningMode(currentLevel, sublevelKey);

    if (completedSublevels[currentLevel][sublevelKey]) {
      button.classList.add("completed");
      button.innerHTML += " ✓";
    }

    container.appendChild(button);
  });
}

function populateChallengeScreen() {
  const container = document.getElementById("challengeButtons");
  container.innerHTML = "";

  Object.keys(challengeSublevels).forEach(challengeKey => {
    const button = document.createElement("button");
    button.className = "challenge-button";
    button.setAttribute("data-challenge", challengeKey);

    const titleDiv = document.createElement("div");
    titleDiv.className = "challenge-title";
    titleDiv.textContent = formatChallengeName(challengeKey);

    const timeSpan = document.createElement("span");
    timeSpan.className = "best-time";
    const bestTime = loadBestTime(challengeKey);
    if (bestTime) {
      const minutes = Math.floor(bestTime / 60);
      const seconds = bestTime % 60;
      timeSpan.textContent = `Best: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
      timeSpan.textContent = "";
    }

    button.appendChild(titleDiv);
    button.appendChild(timeSpan);
    button.onclick = () => startChallengeMode(challengeKey);

    if (completedChallenges[challengeKey]) {
      button.classList.add("completed");
      titleDiv.innerHTML += " ✓";
    }

    container.appendChild(button);
  });
}

// ==================================================
// Button Event Handlers
// ==================================================

function setupButtons() {
  const modeButtons = document.querySelectorAll('.mode-btn');
  modeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const mode = button.getAttribute('data-mode');
      if (mode === 'tutorial') startTutorialMode();
      else if (mode === 'learning') {
        document.getElementById("modeSelectionScreen").style.display = "none";
        document.getElementById("learningLevelScreen").style.display = "flex";
      }
      else if (mode === 'challenge') {
        document.getElementById("modeSelectionScreen").style.display = "none";
        document.getElementById("challengeSublevelScreen").style.display = "flex";
        populateChallengeScreen();
      }
      else if (mode === 'endless') startEndlessMode();
    });
  });

  const levelButtons = document.querySelectorAll('.level-btn');
  levelButtons.forEach(button => {
    button.addEventListener('click', () => {
      const level = button.getAttribute('data-level');
      currentLevel = level;
      document.getElementById("learningLevelScreen").style.display = "none";
      document.getElementById("sublevelScreen").style.display = "flex";
      populateSublevelScreen();
      updateSublevelCompletion();
    });
  });

  document.getElementById("backToModeSelectionFromLearning")?.addEventListener("click", () => {
    document.getElementById("learningLevelScreen").style.display = "none";
    document.getElementById("modeSelectionScreen").style.display = "flex";
  });

  document.getElementById("backToLearningLevelScreen")?.addEventListener("click", () => {
    document.getElementById("sublevelScreen").style.display = "none";
    document.getElementById("learningLevelScreen").style.display = "flex";
  });

  const challengeButtons = document.querySelectorAll('.challenge-btn');
  challengeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const challenge = button.getAttribute('data-challenge');
      startChallengeMode(challenge);
    });
  });

  document.getElementById("achievementsBtn")?.addEventListener("click", () => {
    document.getElementById("achievementsModal").style.display = "flex";
    updateAchievementsDisplay();
  });

  document.getElementById("closeAchievements")?.addEventListener("click", () => {
    document.getElementById("achievementsModal").style.display = "none";
  });

  document.getElementById("resetProgressBtn")?.addEventListener("click", () => {
    if (confirm("Are you sure you want to reset ALL progress? This cannot be undone!")) {
      localStorage.clear();
      location.reload();
    }
  });

  const darkModeToggles = document.querySelectorAll('.darkModeToggle');
  darkModeToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const currentMode = localStorage.getItem('darkMode') === 'true';
      localStorage.setItem('darkMode', !currentMode);
      applyDarkMode();
    });
  });

  document.getElementById("startTutorialBtn")?.addEventListener("click", startTutorialMode);
  document.getElementById("startEndlessBtn")?.addEventListener("click", startEndlessMode);

  document.getElementById("backToMenuFromTutor")?.addEventListener("click", () => {
    document.getElementById("tutorInterface").style.display = "none";
    document.getElementById("modeSelectionScreen").style.display = "flex";
    stopChallengeTimer();
    if (currentMode === "tutorial") {
      document.getElementById("tutorialTip").style.display = "none";
    }
  });

  document.getElementById("backToMenuFromSublevel")?.addEventListener("click", () => {
    document.getElementById("sublevelScreen").style.display = "none";
    document.getElementById("modeSelectionScreen").style.display = "flex";
  });

  document.getElementById("backToMenuFromChallenge")?.addEventListener("click", () => {
    document.getElementById("challengeSublevelScreen").style.display = "none";
    document.getElementById("modeSelectionScreen").style.display = "flex";
  });

  document.getElementById("backToMenuFromAchievements")?.addEventListener("click", () => {
    document.getElementById("achievementScreen").style.display = "none";
    document.getElementById("modeSelectionScreen").style.display = "flex";
  });

  document.getElementById("viewAchievementsBtn")?.addEventListener("click", () => {
    document.getElementById("modeSelectionScreen").style.display = "none";
    document.getElementById("achievementScreen").style.display = "flex";
    updateAchievementsDisplay();
  });

  document.getElementById("showGuideBtn")?.addEventListener("click", window.toggleGuide);

  document.getElementById("backToPrevious")?.addEventListener("click", () => {
    if (currentMode === "learning") {
      document.getElementById("tutorInterface").style.display = "none";
      document.getElementById("sublevelScreen").style.display = "flex";
    } else if (currentMode === "challenge") {
      document.getElementById("tutorInterface").style.display = "none";
      document.getElementById("challengeSublevelScreen").style.display = "flex";
      stopChallengeTimer();
    } else if (currentMode === "tutorial" || currentMode === "endless") {
      document.getElementById("tutorInterface").style.display = "none";
      document.getElementById("modeSelectionScreen").style.display = "flex";
      if (currentMode === "tutorial") {
        document.getElementById("tutorialTip").style.display = "none";
      }
      stopChallengeTimer();
    }
  });

  const inputField = document.getElementById("inputField");
  if (inputField) {
    inputField.addEventListener("input", () => {
      window.updatePreview();
      window.updateOverlay();
    });
    inputField.addEventListener("keypress", window.handleKeyPress);
  }
}

// ==================================================
// Initialization
// ==================================================

document.addEventListener("DOMContentLoaded", () => {
  loadAchievements();
  loadLearningProgress();
  loadChallengeProgress();
  applyDarkMode();
  updateLevelCompletion();
  setupButtons();
  startLatexAnimation();
});

// Export for use in HTML onclick handlers
window.startLearningMode = startLearningMode;
window.startTutorialMode = startTutorialMode;
window.startChallengeMode = startChallengeMode;
window.startEndlessMode = startEndlessMode;
