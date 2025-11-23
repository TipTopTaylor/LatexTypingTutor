// Achievement System
import { saveToStorage, loadFromStorage } from '../utils/storage.js';
import { playSound } from '../utils/helpers.js';

// Achievement state
export let achievements = {
  challengeUnder2: false,
  challengeUnder1: false,
  challengeAllUnder5: false,
  challengeAllUnder3: false,
  endless5InRow: false,
  endless10InRow: false,
  finishPhysicist: false,
  finishMathematicians: false,
  graduatedLatexKindergarten: false,
  finishLearning: false,
  finishChallenge: false,
  completionist: false
};

// Popup queue for sequential achievement displays
let popupQueue = [];
let isPopupActive = false;

// Sound for achievements
const achievementSound = new Audio('achievement-sound.mp3');
achievementSound.load();

export function loadAchievements() {
  const saved = loadFromStorage("achievements", {});
  achievements = { ...achievements, ...saved };
  updateAchievementsDisplay();
}

export function saveAchievements() {
  saveToStorage("achievements", achievements);
}

export function unlockAchievement(name) {
  if (!achievements[name]) {
    achievements[name] = true;
    saveAchievements();
    updateAchievementsDisplay();
    showAchievementPopup(formatAchievementName(name));
    checkForCompletionist();
  }
}

export function unlockAchievements(achievementKeys) {
  let unlockedNames = [];
  achievementKeys.forEach(key => {
    if (!achievements[key]) {
      achievements[key] = true;
      unlockedNames.push(formatAchievementName(key));
    }
  });
  if (unlockedNames.length > 0) {
    saveAchievements();
    updateAchievementsDisplay();
    unlockedNames.forEach(name => { showAchievementPopup(name); });
    checkForCompletionist();
  }
}

export function updateAchievementsDisplay() {
  document.querySelectorAll(".achievement").forEach(el => {
    let achKey = el.getAttribute("data-achievement");
    if (achievements[achKey]) {
      el.classList.add("earned");
    }
  });
}

function checkForCompletionist() {
  const keysToCheck = Object.keys(achievements).filter(key => key !== "completionist");
  if (keysToCheck.every(key => achievements[key]) && !achievements.completionist) {
    unlockAchievement("completionist");
  }
}

function formatAchievementName(key) {
  const names = {
    finishLearning: "The Learner 🏆",
    finishChallenge: "The Challenger 🥇",
    challengeUnder2: "Speedster ⏱️",
    challengeUnder1: "Need for Speed ⚡",
    challengeAllUnder5: "Gotta Go Fast! 🔥",
    challengeAllUnder3: "The Flash 🚀",
    endless5InRow: "Dedicated 5️⃣",
    endless10InRow: "The Professional 🌟",
    finishPhysicist: "Einstein 🔬",
    finishMathematicians: "Fibonacci 📐",
    graduatedLatexKindergarten: "Graduated Latex Kindergarten! 🎓",
    completionist: "The Completionist 💯"
  };
  return names[key] || key;
}

function showNextPopup() {
  if (popupQueue.length === 0) {
    isPopupActive = false;
    return;
  }
  isPopupActive = true;
  const message = popupQueue.shift();
  playSound(achievementSound);

  const popup = document.createElement("div");
  popup.className = "achievement-popup";
  popup.innerText = "Achievement Unlocked:\n" + message;
  popup.style.opacity = "1";
  document.body.appendChild(popup);

  setTimeout(() => { popup.style.opacity = "0"; }, 3000);
  setTimeout(() => {
    popup.remove();
    showNextPopup();
  }, 4000);
}

function queuePopup(message) {
  popupQueue.push(message);
  if (!isPopupActive) {
    showNextPopup();
  }
}

function showAchievementPopup(message) {
  queuePopup(message);
}
