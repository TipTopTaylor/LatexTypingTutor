// Utility Helper Functions

export function getHintShell(token) {
  // Returns a shell (syntax hint) for a given LaTeX token.
  if (/\\begin\{pmatrix\}/.test(token)) {
    return '\\begin{pmatrix} 1 & 0 \\\\ 0 & 1\\end{pmatrix}';
  }
  if (token.includes("\\partial")) {
    return '\\frac{\\partial x}{\\partial y}';
  }
  if (token.includes("\\hbar")) {
    return '\\hbar';
  }
  if (token.includes("\\lim")) {
    return '\\lim_{x \\to 1}';
  }
  if (token.includes("\\iiint")) {
    return '\\iiint_{}^{}';
  }

  if (/^\d+$/.test(token)) return '';
  if (/^[a-zA-Z]+$/.test(token)) return '';

  const match = token.match(/^(\\[a-zA-Z]+)/);
  if (match) {
    const command = match[1];
    if (command === '\\frac') return '\\frac{}{}';
    if (command === '\\int' || command === '\\iint') return command + '^{}_{}';
    if (command === '\\sum') return '\\sum^{}_{}';
    if (command === '\\hat') return '\\hat{}';
    if (command === '\\vec') return '\\vec{}';
    if (command === '\\dot') return '\\dot{}';
  }

  if (token.startsWith('^')) return '^{}';
  if (token.startsWith('_')) return '_{}';

  return token;
}

export function playSound(audio) {
  audio.currentTime = 0;
  audio.play().catch(err => console.log("Error playing sound:", err));
}

export function formatSublevelName(key) {
  const names = {
    additionSubtraction: "Addition & Subtraction",
    multiplicationDivision: "Multiplication & Division",
    exponentsSubscripts: "Exponents & Subscripts",
    fractions: "Fractions & Radicals",
    greekIntroduction: "Greek Letters - Basics",
    greekExpressions: "Greek Letters - Advanced",
    simpleIntegrals: "Simple Integrals",
    doubleIntegralsGreek: "Double Integrals & Greek",
    contourIntegrals: "Contour Integrals",
    complexIntegrals: "Complex Integrals",
    basicSum: "Basic Summations",
    complexSums: "Complex Summations",
    limits: "Limits",
    simpleMatrix: "Simple Matrices",
    complexMatrix: "Complex Matrices",
    commonMatrices: "Common Matrices",
    allSkills: "Master Challenge",
    forPhysicistI: "Physics Mastery I",
    forPhysicistII: "Physics Mastery II",
    forMathematiciansI: "Math Mastery I",
    forMathematiciansII: "Math Mastery II"
  };
  return names[key] || key;
}

export function formatChallengeName(key) {
  const names = {
    challenge1: "Speed Challenge 1",
    challenge2: "Speed Challenge 2",
    challenge3: "Speed Challenge 3",
    challenge4: "Speed Challenge 4",
    challenge5: "Speed Challenge 5",
    challenge6: "Speed Challenge 6"
  };
  return names[key] || key;
}

export function getAccessMessage(levelId) {
  return '';
}
