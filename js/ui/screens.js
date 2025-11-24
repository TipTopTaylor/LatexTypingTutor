// Screen Management - Show/Hide different screens

export function showScreen(screenId) {
  const screens = [
    'modeSelectionScreen',
    'learningLevelScreen',
    'sublevelScreen',
    'challengeSublevelScreen',
    'endlessModeScreen',
    'tutorInterface',
    'authScreen'
  ];

  screens.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.style.display = 'flex';
  }
}

export function goToAuthScreen() {
  showScreen('authScreen');
}

export function goToModeSelection() {
  showScreen('modeSelectionScreen');
}

export function goToLearningLevel() {
  showScreen('learningLevelScreen');
}

export function goToSublevel() {
  showScreen('sublevelScreen');
}

export function goToChallengeSublevel() {
  showScreen('challengeSublevelScreen');
}

export function goToEndlessMode() {
  showScreen('endlessModeScreen');
}

export function goToTutorInterface() {
  showScreen('tutorInterface');
}
