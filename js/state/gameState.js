// Global Game State Management

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

  state.currentMode = "";
  state.currentIndex = 0;
  state.tutorialIndex = 0;
  state.challengeIndex = 0;
  state.endlessStreak = 0;
}

  state.currentMode = mode;
}

  state.currentLevel = level;
}

  state.currentSubLevel = sublevel;
}

  state.currentChallenge = challenge;
}
