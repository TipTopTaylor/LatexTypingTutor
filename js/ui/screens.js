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

export function goToLearningLevelScreen() {
  showScreen('learningLevelScreen');
}

export function goToSublevelScreen() {
  showScreen('sublevelScreen');
}

export function goToChallengeScreen() {
  showScreen('challengeSublevelScreen');
}

export function goToEndlessScreen() {
  showScreen('endlessModeScreen');
}

export function goToTutorInterface() {
  showScreen('tutorInterface');
}
