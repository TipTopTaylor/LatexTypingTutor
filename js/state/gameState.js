// Global Game State Management

export const state = {
  // Mode tracking
  currentMode: "",
  currentLevel: '',
  currentSubLevel: '',
  currentChallenge: '',
  currentExpression: '',

  // Progress indices
  tutorialIndex: 0,
  challengeIndex: 0,
  currentIndex: 0,

  // Endless mode
  endlessStreak: 0,

  // Tutorial tips
  tutorialMultiplicationTipShown: false,
  tutorialFractionTipShown: false,

  // Timer
  challengeTimerInterval: null,
  challengeTimerSeconds: 0
};

export function resetState() {
  state.currentMode = "";
  state.currentIndex = 0;
  state.tutorialIndex = 0;
  state.challengeIndex = 0;
  state.endlessStreak = 0;
}

export function setMode(mode) {
  state.currentMode = mode;
}

export function setLevel(level) {
  state.currentLevel = level;
}

export function setSubLevel(sublevel) {
  state.currentSubLevel = sublevel;
}

export function setChallenge(challenge) {
  state.currentChallenge = challenge;
}
