# LaTeX Typing Tutor - Refactored JavaScript Structure

## Overview
This directory contains the refactored modular code for the LaTeX Typing Tutor application. The original ~2000 line `script7.js` file has been broken down into logical modules for better maintainability and organization.

## Directory Structure

```
js/
├── app.js                    # Main application entry point and orchestrator
├── legacy.js                 # Temporary file containing un-refactored logic
├── README.md                 # This file
│
├── data/                     # All question and level data
│   ├── levelData.js          # Learning mode levels and questions
│   ├── challengeData.js      # Challenge mode questions
│   ├── tutorialData.js       # Tutorial mode questions
│   └── progress.js           # Progress tracking and save/load functions
│
├── utils/                    # Utility functions
│   ├── helpers.js            # Helper functions (getShell, playSound, etc.)
│   └── storage.js            # LocalStorage management
│
├── ui/                       # User interface modules
│   ├── screens.js            # Screen navigation and management
│   ├── darkMode.js           # Dark mode toggle functionality
│   └── animation.js          # LaTeX intro animation
│
├── achievements/             # Achievement system
│   └── achievementSystem.js  # Achievement tracking, unlocking, and display
│
└── state/                    # Global state management
    └── gameState.js          # Centralized game state

## Module Responsibilities

### app.js
- Main entry point for the application
- Imports and initializes all modules
- Sets up event listeners
- Coordinates between different modules
- Maintains backward compatibility with legacy code

### data/ modules
- **levelData.js**: Contains all learning mode questions organized by level and sublevel
- **challengeData.js**: Contains all challenge mode questions
- **tutorialData.js**: Contains tutorial mode questions
- **progress.js**: Handles saving and loading user progress

### utils/ modules
- **helpers.js**: Utility functions like `getShell()` for syntax hints
- **storage.js**: Abstraction layer for localStorage operations

### ui/ modules
- **screens.js**: Functions to show/hide different game screens
- **darkMode.js**: Dark mode toggle and persistence
- **animation.js**: The animated LaTeX equation on the intro screen

### achievements/ modules
- **achievementSystem.js**: Complete achievement tracking system including unlock logic, popup queues, and display updates

### state/ modules
- **gameState.js**: Centralized state management for game mode, levels, progress indices, etc.

## Legacy Code

`legacy.js` currently contains all the complex game logic that hasn't been refactored yet, including:
- Question rendering and display
- Answer checking logic
- Mode-specific game logic (tutorial, learning, challenge, endless)
- Input handling and overlay management
- Timer functionality
- Confetti effects
- And much more...

### Future Refactoring Plan

The next steps for refactoring should focus on extracting from `legacy.js`:

1. **Create modes/ directory** with separate files for:
   - tutorialMode.js
   - learningMode.js
   - challengeMode.js
   - endlessMode.js

2. **Create ui/rendering.js** for:
   - Question display logic
   - Progress bar updates
   - Input/overlay management

3. **Create ui/feedback.js** for:
   - Confetti effects
   - Sound effects
   - Visual feedback (flash, shake)

4. **Create core/gameLogic.js** for:
   - Answer checking
   - Score/streak tracking
   - Timer management

## Usage

The application now uses ES6 modules. The main `app.js` file is loaded as a module:

```html
<script type="module" src="js/app.js"></script>
```

### Importing Modules

Example of how to import from other modules:

```javascript
import { allSublevels } from './data/levelData.js';
import { unlockAchievement } from './achievements/achievementSystem.js';
import { showScreen } from './ui/screens.js';
```

### Global Window Object

For backwards compatibility with inline HTML event handlers, key functions are exposed on `window.latexApp`:

```javascript
window.latexApp = {
  state,
  showScreen,
  unlockAchievement,
  // ... etc
};
```

## Benefits of This Structure

1. **Maintainability**: Each file has a single, clear purpose
2. **Readability**: Much easier to find and understand specific functionality
3. **Testability**: Modules can be unit tested independently
4. **Scalability**: New features can be added without growing monolithic files
5. **Collaboration**: Multiple developers can work on different modules
6. **Debugging**: Easier to track down bugs in smaller, focused files

## Notes

- All modules use ES6 `export/import` syntax
- The original `script7.js` is preserved for reference
- Dark mode preference is persisted in localStorage
- Achievement and progress data are saved to localStorage
