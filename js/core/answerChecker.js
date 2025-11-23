// Answer Checking and Validation
import { state } from '../state/gameState.js';
import { allSublevels, completedSublevels } from '../data/levelData.js';
import { challengeSublevels, completedChallenges } from '../data/challengeData.js';
import { tutorialQuestions } from '../data/tutorialData.js';

export function normalizeInput(input) {
  input = input.replace(/\s+/g, '')
               .replace(/\{\s*/g, '{')
               .replace(/\s*\}/g, '}')
               .replace(/\\\\times/g, '\\\\times');
  input = input.replace(/(\\(?:int|iint|sum))(\^{[^}]+})(_\{[^}]+\})/g, '$1$3$2');
  return input;
}

export function checkAnswer(userInput) {
  const input = normalizeInput(userInput);
  let correctLatex = "";

  // Get correct answer based on current mode
  if (state.currentMode === "challenge") {
    correctLatex = normalizeInput(challengeSublevels[state.currentChallenge][state.challengeIndex].latex);
  } else if (state.currentMode === "learning") {
    if (state.currentSubLevel) {
      correctLatex = normalizeInput(allSublevels[state.currentLevel][state.currentSubLevel][state.currentIndex].latex);
    }
  } else if (state.currentMode === "endless") {
    correctLatex = normalizeInput(state.currentExpression.latex);
  } else if (state.currentMode === "tutorial") {
    correctLatex = normalizeInput(tutorialQuestions[state.tutorialIndex].latex);
  }

  return input === correctLatex;
}
