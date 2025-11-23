// Progress Tracking
import { saveToStorage, loadFromStorage } from '../utils/storage.js';
import { completedSublevels } from './levelData.js';
import { completedChallenges } from './challengeData.js';

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
  return loadFromStorage(`bestTime_${challengeName}`, null);
}

export function saveBestTime(challengeName, time) {
  saveToStorage(`bestTime_${challengeName}`, time);
}
