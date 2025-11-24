// Progress Tracking
import { saveToStorage, loadFromStorage } from '../utils/storage.js';

export let completedSublevels = {
  level1: {},
  level2: {},
  level3: {}
};

export let completedChallenges = {};

export function loadLearningProgress() {
  const saved = loadFromStorage("completedSublevels");
  if (saved) {
    Object.keys(saved).forEach(level => {
      if (completedSublevels[level]) {
        Object.keys(saved[level]).forEach(sublevel => {
          completedSublevels[level][sublevel] = saved[level][sublevel];
        });
      }
    });
  }
}

export function saveLearningProgress() {
  saveToStorage("completedSublevels", completedSublevels);
}

export function loadChallengeProgress() {
  const saved = loadFromStorage("completedChallenges");
  if (saved) {
    Object.keys(saved).forEach(challenge => {
      completedChallenges[challenge] = saved[challenge];
    });
  }
}

export function saveChallengeProgress() {
  saveToStorage("completedChallenges", completedChallenges);
}

export function loadBestEndlessStreak() {
  return loadFromStorage("bestEndlessStreak", 0);
}

export function saveBestEndlessStreak(streak) {
  saveToStorage("bestEndlessStreak", streak);
}

export function loadBestTime(challengeName) {
  const bestTimes = loadFromStorage("bestTimes", {});
  return bestTimes[challengeName] || null;
}

export function saveBestTime(challengeName, timeInSeconds) {
  const bestTimes = loadFromStorage("bestTimes", {});
  bestTimes[challengeName] = timeInSeconds;
  saveToStorage("bestTimes", bestTimes);
}
