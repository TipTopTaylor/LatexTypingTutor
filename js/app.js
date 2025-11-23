/**
 * LaTeX Typing Tutor - Main Application Entry Point
 *
 * This is the main orchestrator that imports and initializes all modules.
 * The application has been refactored from a single 2000+ line file into
 * organized modules for better maintainability.
 *
 * Module Structure:
 * - /data: All question data, levels, challenges, tutorials
 * - /utils: Helper functions and storage management
 * - /ui: User interface, screens, animations, dark mode
 * - /achievements: Achievement tracking and notifications
 * - /state: Global game state management
 * - /modes: Game mode logic (tutorial, learning, challenge, endless)
 */

// ============================================
// IMPORTS - Data Modules
// ============================================
import { allSublevels, completedSublevels } from './data/levelData.js';
import { challengeSublevels, completedChallenges } from './data/challengeData.js';
import { tutorialQuestions } from './data/tutorialData.js';

// ============================================
// IMPORTS - Utility Modules
// ============================================
import { getShell, playSound } from './utils/helpers.js';
import { saveToStorage, loadFromStorage } from './utils/storage.js';

// ============================================
// IMPORTS - UI Modules
// ============================================
import { toggleDarkMode, applyDarkMode, attachDarkModeToggle } from './ui/darkMode.js';
import { startLatexAnimation } from './ui/animation.js';
import { showScreen, goToModeSelection, goToLearningLevelScreen, goToTutorInterface } from './ui/screens.js';

// ============================================
// IMPORTS - Achievement System
// ============================================
import {
  loadAchievements,
  saveAchievements,
  unlockAchievement,
  updateAchievementsDisplay,
  achievements
} from './achievements/achievementSystem.js';

// ============================================
// IMPORTS - State Management
// ============================================
import { state, setMode, setLevel, setSubLevel } from './state/gameState.js';

// ============================================
// LEGACY CODE NOTE
// ============================================
// The legacy.js file is loaded as a regular <script> tag (not a module)
// to maintain compatibility with inline HTML event handlers like onclick="checkAnswer()".
// This allows the app to work while we gradually refactor the remaining code.

// ============================================
// APPLICATION INITIALIZATION
// ============================================

/**
 * Initialize the modular system when DOM is ready
 *
 * Note: Most initialization is handled by legacy.js for now.
 * This file primarily serves to load and expose the new modular components.
 */
function initializeModules() {
  console.log('🎨 Loading modular components...');

  // The modules are now available to the legacy code if needed
  console.log('✅ Modular system ready!');
}

// ============================================
// EXPORTS - Make modules available globally for legacy code
// ============================================
window.latexModules = {
  // Data
  allSublevels,
  completedSublevels,
  challengeSublevels,
  completedChallenges,
  tutorialQuestions,

  // State
  state,
  setMode,
  setLevel,
  setSubLevel,

  // UI
  showScreen,
  goToModeSelection,
  goToLearningLevelScreen,
  goToTutorInterface,
  toggleDarkMode,
  applyDarkMode,
  attachDarkModeToggle,
  startLatexAnimation,

  // Achievements
  loadAchievements,
  saveAchievements,
  unlockAchievement,
  updateAchievementsDisplay,
  achievements,

  // Utils
  getShell,
  playSound,
  saveToStorage,
  loadFromStorage
};

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeModules);
} else {
  initializeModules();
}

console.log('📦 Modular components loaded. Legacy code can access via window.latexModules');
