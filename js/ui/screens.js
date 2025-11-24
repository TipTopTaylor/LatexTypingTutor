// Screen Management - Show/Hide different screens

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

  showScreen('authScreen');
}

  showScreen('modeSelectionScreen');
}

  showScreen('learningLevelScreen');
}

  showScreen('sublevelScreen');
}

  showScreen('challengeSublevelScreen');
}

  showScreen('endlessModeScreen');
}

  showScreen('tutorInterface');
}
