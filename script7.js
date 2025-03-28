// ==================================================
// Utility Function: getShell()
// Returns a shell (syntax hint) for a given LaTeX token.
// ==================================================
function getShell(token) {
  // If token is a matrix, always return the 2×2 identity matrix syntax.
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
  }
  if (token.startsWith('^')) return '^{}';
  if (token.startsWith('_')) return '_{}';
  return token;
}
// ==================================================
// Achievement System Setup
// ==================================================
let achievements = {
  challengeUnder2: false,
  challengeUnder1: false,
  challengeAllUnder5: false,
  challengeAllUnder3: false,
  endless5InRow: false,
  endless10InRow: false,
  finishPhysicist: false,
  finishMathematicians: false,
  graduatedLatexKindergarten: false,
  finishLearning: false,
  finishChallenge: false,
  completionist: false
};


function loadAchievements() {
  let saved = JSON.parse(localStorage.getItem("achievements")) || {};
  achievements = { ...achievements, ...saved };
  updateAchievementsDisplay();
}

function saveAchievements() {
  localStorage.setItem("achievements", JSON.stringify(achievements));
}

function allSublevelsCompleted() {
  return Object.values(completedSublevels).every(level =>
    Object.values(level).every(sublevel => sublevel)
  );
}

// ==================================================
// Popup Queue Management
// ==================================================
let popupQueue = [];
let isPopupActive = false;

function showNextPopup() {
  if (popupQueue.length === 0) {
    isPopupActive = false;
    return;
  }
  isPopupActive = true;
  const message = popupQueue.shift();
  playAchievementSound();
  const popup = document.createElement("div");
  popup.className = "achievement-popup";
  popup.innerText = "Achievement Unlocked:\n" + message;
  popup.style.opacity = "1";
  document.body.appendChild(popup);
  
  setTimeout(() => { popup.style.opacity = "0"; }, 3000);
  setTimeout(() => {
    popup.remove();
    showNextPopup();
  }, 4000);
}

function queuePopup(message) {
  popupQueue.push(message);
  if (!isPopupActive) {
    showNextPopup();
  }
}

function showAchievementPopup(message) {
  queuePopup(message);
}

// ==================================================
// Achievement Unlock Functions
// ==================================================

function checkForCompletionist() {
  // Create an array of achievement keys to check (excluding the "completionist" itself)
  const keysToCheck = Object.keys(achievements).filter(key => key !== "completionist");
  
  // If all achievements are true and "completionist" is not yet unlocked, unlock it.
  if (keysToCheck.every(key => achievements[key]) && !achievements.completionist) {
    unlockAchievement("completionist");
  }
}

function unlockAchievements(achievementKeys) {
  let unlockedNames = [];
  achievementKeys.forEach(key => {
    if (!achievements[key]) {
      achievements[key] = true;
      unlockedNames.push(formatAchievementName(key));
    }
  });
  if (unlockedNames.length > 0) {
    saveAchievements();
    updateAchievementsDisplay();
    unlockedNames.forEach(name => { showAchievementPopup(name); });
    checkForCompletionist();
  }
}

function unlockAchievement(name) {
  if (!achievements[name]) {
    achievements[name] = true;
    saveAchievements();
    updateAchievementsDisplay();
    showAchievementPopup(formatAchievementName(name));
    checkForCompletionist();
  }
}

function updateAchievementsDisplay() {
  document.querySelectorAll(".achievement").forEach(el => {
    let achKey = el.getAttribute("data-achievement");
    if (achievements[achKey]) {
      el.classList.add("earned");
    }
  });
}

function playAchievementSound() {
  achievementSound.currentTime = 0;
  achievementSound.play().catch(err => console.log("Achievement sound play error:", err));
}

function formatAchievementName(key) {
  const names = {
    finishLearning: "The Learner 🏆",
    finishChallenge: "The Challenger 🥇",
    challengeUnder2: "Speedster ⏱️",
    challengeUnder1: "Need for Speed ⚡",
    challengeAllUnder5: "Gotta Go Fast! 🔥",
    challengeAllUnder3: "The Flash 🚀",
    endless5InRow: "Dedicated 5️⃣",
    endless10InRow: "The Professional 🌟",
    finishPhysicist: "Einstein 🔬",
    finishMathematicians: "Fibonacci 📐",
    graduatedLatexKindergarten: "Graduated Latex Kindergarten! 🎓",
    completionist: "The Completionist 💯" 
  };
  return names[key] || key;
}

// ==================================================
// Data Definitions & Tracking
// ==================================================

const allSublevels = {
  level1: {
    additionSubtraction: [
      { latex: "2+2", math: "2+2" },
      { latex: "6+3-2=7", math: "6+3-2=7" },
      { latex: "3+5", math: "3+5" },
      { latex: "10-4", math: "10-4" },
      { latex: "5+6=11", math: "5+6=11" },
      { latex: "9-3=6", math: "9-3=6" },
      { latex: "1+2+3=6", math: "1+2+3=6" },
      { latex: "8-2-1=5", math: "8-2-1=5" },
      { latex: "4+4-3=5", math: "4+4-3=5" },
      { latex: "3 \\pm 0.5", math: "3 \\pm 0.5"},
      { latex: "6 \\pm 0.3", math: "6 \\pm 0.3"}
    ],
    multiplicationDivision: [
      { latex: "2\\times3", math: "2\\times3" },
      { latex: "6\\div2", math: "6\\div2" },
      { latex: "4\\times5", math: "4\\times5" },
      { latex: "8\\div4", math: "8\\div4" },
      { latex: "3\\times3=1", math: "3\\times3=1" },
      { latex: "9\\div3=3", math: "9\\div3=3" },
      { latex: "5\\times2", math: "5\\times2" },
      { latex: "10\\div2=5", math: "10\\div2=5" },
      { latex: "7\\times3", math: "7\\times3" },
      { latex: "12\\div4", math: "12\\div4" }
    ],
    exponentsSubscripts: [
      { latex: "x^{2}", math: "x^{2}" },
      { latex: "x_{1}", math: "x_{1}" },
      { latex: "y^{3}", math: "y^{3}" },
      { latex: "y_{2}", math: "y_{2}" },
      { latex: "z^{4}", math: "z^{4}" },
      { latex: "z_{3}", math: "z_{3}" },
      { latex: "a^{5}", math: "a^{5}" },
      { latex: "a_{4}", math: "a_{4}" },
      { latex: "b^{6}", math: "b^{6}" },
      { latex: "b_{5}", math: "b_{5}" }
    ],
    checkpoint1: [
      { latex: "x_{1}+2\\times3^{2}-4\\div2", math: "x_{1}+2\\times3^{2}-4\\div2" },
      { latex: "5\\times x^{2}-y_{3}+8", math: "5\\times x^{2}-y_{3}+8" },
      { latex: "a_{1}+b_{2}-c_{3}\\times d^{4}", math: "a_{1}+b_{2}-c_{3}\\times d^{4}" },
      { latex: "7+8\\div2-3^{2}+x_{4}", math: "7+8\\div2-3^{2}+x_{4}" },
      { latex: "2^{3}+3\\times4-5_{6}", math: "2^{3}+3\\times4-5_{6}" },
      { latex: "m^{2}\\times n_{1}+6-4\\div2", math: "m^{2}\\times n_{1}+6-4\\div2" },
      { latex: "p_{2}+q^{3}-7+8\\times2", math: "p_{2}+q^{3}-7+8\\times2" },
      { latex: "3\\times x_{3}-2^{2}+4\\div2", math: "3\\times x_{3}-2^{2}+4\\div2" },
      { latex: "9+2^{3}\\times y_{5}-6", math: "9+2^{3}\\times y_{5}-6" },
      { latex: "a^{2}+b_{3}\\div2-4+5\\times c_{1}", math: "a^{2}+b_{3}\\div2-4+5\\times c_{1}" }
    ],
    fractions: [
      { latex: "\\frac{6}{2}", math: "\\frac{6}{2}" },
      { latex: "\\frac{1}{2}", math: "\\frac{1}{2}" },
      { latex: "\\frac{3}{4}", math: "\\frac{3}{4}" },
      { latex: "\\frac{5}{8}", math: "\\frac{5}{8}" },
      { latex: "\\frac{7}{9}", math: "\\frac{7}{9}" },
      { latex: "\\frac{10}{3}", math: "\\frac{10}{3}" },
      { latex: "\\frac{2}{5}", math: "\\frac{2}{5}" },
      { latex: "\\frac{11}{4}", math: "\\frac{11}{4}" },
      { latex: "\\frac{8}{3}", math: "\\frac{8}{3}" },
      { latex: "\\frac{12}{7}", math: "\\frac{12}{7}" }
    ],
    checkpoint2: [
      { latex: "\\frac{2^{3}+4}{5}-x_{2}", math: "\\frac{2^{3}+4}{5}-x_{2}" },
      { latex: "\\frac{x_{1}+3^{2}-5}{4}\\times2", math: "\\frac{x_{1}+3^{2}-5}{4}\\times2" },
      { latex: "\\frac{4^{2}-5+x_{3}}{3}+2", math: "\\frac{4^{2}-5+x_{3}}{3}+2" },
      { latex: "\\frac{6+5^{2}-x_{4}}{8}-3", math: "\\frac{6+5^{2}-x_{4}}{8}-3" },
      { latex: "\\frac{7\\times x_{2}-4^{3}}{9}+5", math: "\\frac{7\\times x_{2}-4^{3}}{9}+5" },
      { latex: "\\frac{3^{3}+2\\times x_{5}}{7}-1", math: "\\frac{3^{3}+2\\times x_{5}}{7}-1" },
      { latex: "\\frac{x_{6}-2^{4}+5}{10}\\times4", math: "\\frac{x_{6}-2^{4}+5}{10}\\times4" },
      { latex: "\\frac{5+3^{2}-x_{7}}{6}+2", math: "\\frac{5+3^{2}-x_{7}}{6}+2" },
      { latex: "\\frac{4\\times x_{8}+3^{3}-2}{5}", math: "\\frac{4\\times x_{8}+3^{3}-2}{5}" },
      { latex: "\\frac{2^{3}-5+x_{9}}{4}\\times7", math: "\\frac{2^{3}-5+x_{9}}{4}\\times7" }
    ]
  },
  level2: {
    greekIntroduction: [
      { latex: "\\alpha", math: "\\alpha" },
      { latex: "\\beta", math: "\\beta" },
      { latex: "\\gamma", math: "\\gamma" },
      { latex: "\\delta", math: "\\delta" },
      { latex: "\\epsilon", math: "\\epsilon" },
      { latex: "\\zeta", math: "\\zeta" },
      { latex: "\\eta", math: "\\eta" },
      { latex: "\\theta", math: "\\theta" },
      { latex: "\\Psi", math: "\\Psi" },
      { latex: "\\kappa", math: "\\kappa" },
      { latex: "\\lambda", math: "\\lambda" },
      { latex: "\\mu", math: "\\mu" },
      { latex: "\\Theta", math: "\\Theta" },
      { latex: "\\xi", math: "\\xi" },
      { latex: "\\Delta", math: "\\Delta" },
      { latex: "\\pi", math: "\\pi" },
      { latex: "\\rho", math: "\\rho" },
      { latex: "\\sigma", math: "\\sigma" },
      { latex: "\\tau", math: "\\tau" },
      { latex: "\\varepsilon", math: "\\varepsilon" },
      { latex: "\\Sigma", math: "\\Sigma" },
      { latex: "\\phi", math: "\\phi" },
      { latex: "\\chi", math: "\\chi" },
      { latex: "\\psi", math: "\\psi" },
      { latex: "\\omega", math: "\\omega" },
      { latex: "\\Omega", math: "\\Omega" }
    ],
    greekExpressions: [
      { latex: "a+\\alpha", math: "a+\\alpha" },
      { latex: "\\epsilon+\\varepsilon", math: "\\epsilon+\\varepsilon" },
      { latex: "b-\\beta", math: "b-\\beta" },
      { latex: "\\gamma+\\delta", math: "\\gamma+\\delta" },
      { latex: "\\theta-\\epsilon", math: "\\theta-\\epsilon" },
      { latex: "\\lambda\\times\\mu", math: "\\lambda\\times\\mu" },
      { latex: "\\Psi\\div\\sigma", math: "\\Psi\\div\\sigma" },
      { latex: "\\frac{\\pi}{\\rho}", math: "\\frac{\\pi}{\\rho}" },
      { latex: "\\sigma+\\tau-\\Omega", math: "\\sigma+\\tau-\\Omega" },
      { latex: "\\frac{\\phi+\\chi}{\\psi}", math: "\\frac{\\phi+\\chi}{\\psi}" },
      { latex: "\\xi\\times\\omega+\\alpha", math: "\\xi\\times\\omega+\\alpha" }
    ]
  },
  level3: {
    simpleIntegrals: [
      { latex: "\\int f(x)dx", math: "\\int f(x)dx" },
      { latex: "\\int_{a}^{b} f(x)dx", math: "\\int_{a}^{b} f(x)dx" },
      { latex: "\\int x dx = \\frac{1}{2}x^2 + C", math: "\\int xdx = \\frac{1}{2}x^2 + C" },
      { latex: "\\int \\sin(x)dx = -\\cos(x) + C", math: "\\int \\sin(x)dx = -\\cos(x) + C" },
      { latex: "\\int e^xdx = e^x + C", math: "\\int e^xdx = e^x + C" }
    ],
    doubleIntegralsGreek: [
      { latex: "\\iint_{D} f(x,y)dxdy", math: "\\iint_{D} f(x,y) dxdy" },
      { latex: "\\iint_{D}\\alpha dxdy", math: "\\iint_{D}\\alpha dxdy" },
      { latex: "\\iint_{D} (x+y)dxdy", math: "\\iint_{D} (x+y) dxdy" },
      { latex: "\\iint_{D} \\sin(x)\\cos(y) dxdy", math: "\\iint_{D} \\sin(x)\\cos(y) dxdy" },
      { latex: "\\iint_{D} e^{-(x^2+y^2)} dxdy", math: "\\iint_{D} e^{-(x^2+y^2)} dxdy" }
    ],
    contourIntegrals: [
      { latex: "\\oint_{C} f(z)dz", math: "\\oint_{C} f(z)dz" },
      { latex: "\\oint_{C} \\frac{dz}{z}", math: "\\oint_{C} \\frac{dz}{z}" },
      { latex: "\\oint_{C} \\frac{1}{z-a}dz", math: "\\oint_{C} \\frac{1}{z-a}dz" },
      { latex: "\\oint_{C} \\frac{z}{z^2+1}dz", math: "\\oint_{C} \\frac{z}{z^2+1}dz" },
      { latex: "\\oint_{C} \\frac{e^z}{z}dz", math: "\\oint_{C} \\frac{e^z}{z}dz" }
    ],
    complexIntegrals: [
      { latex: "\\int_{0}^{1}\\frac{\\alpha}{x+\\beta}dx", math: "\\int_{0}^{1}\\frac{\\alpha}{x+\\beta}dx" }, // single integral
      { latex: "\\iint_{D}\\frac{\\gamma}{x^2+y^2}dxdy", math: "\\iint_{D}\\frac{\\gamma}{x^2+y^2}dxdy" }, // double integral 1
      { latex: "\\iint_{D}\\frac{\\delta}{\\sqrt{x+y}}dxdy", math: "\\iint_{D}\\frac{\\delta}{\\sqrt{x+y}}dxdy" }, // double integral 2
      { latex: "\\oint_{C}\\frac{1}{z}dz", math: "\\oint_{C}\\frac{1}{z}dz" }, // contour integral 1
      { latex: "\\oint_{C}\\frac{e^z}{z^2+1}dz", math: "\\oint_{C}\\frac{e^z}{z^2+1}dz" } // contour integral 2
    ]
  },
  level4: {
    basicSum: [
      { latex: "\\sum_{i=1}^{n} i", math: "\\sum_{i=1}^{n} i" },
      { latex: "\\sum_{i=1}^{n} 1", math: "\\sum_{i=1}^{n} 1" },
      { latex: "\\sum_{i=1}^{n} i^{2}", math: "\\sum_{i=1}^{n} i^{2}" },
      { latex: "\\sum_{i=0}^{n} 2^{i}", math: "\\sum_{i=0}^{n} 2^{i}" },
      { latex: "\\sum_{i=1}^{n} \\frac{1}{i}", math: "\\sum_{i=1}^{n} \\frac{1}{i}" }
    ],
    complexSums: [
      { latex: "\\sum_{i=1}^{n}\\alpha_{i}", math: "\\sum_{i=1}^{n}\\alpha_{i}" },
      { latex: "\\int_{0}^{1} xdx + \\sum_{i=1}^{n} i", math: "\\int_{0}^{1} xdx + \\sum_{i=1}^{n} i" },
      { latex: "\\sum_{i=1}^{n} \\frac{1}{i^{2}}", math: "\\sum_{i=1}^{n} \\frac{1}{i^{2}}" },
      { latex: "\\sum_{i=1}^{n} (i+\\alpha)", math: "\\sum_{i=1}^{n} (i+\\alpha)" },
      { latex: "\\int_{0}^{\\pi} \\sin(x)dx + \\sum_{i=1}^{n} \\cos(i)", math: "\\int_{0}^{\\pi} \\sin(x)dx + \\sum_{i=1}^{n} \\cos(i)" }
    ],
    limits: [
      { latex: "\\lim_{x\\to 0} \\frac{\\sin x}{x} = 1", math: "\\lim_{x\\to 0} \\frac{\\sin x}{x} = 1" },
      { latex: "\\lim_{x\\to \\infty} \\frac{1}{x} = 0", math: "\\lim_{x\\to \\infty} \\frac{1}{x} = 0" },
      { latex: "\\lim_{x\\to 2} \\frac{x^{2} - 4}{x - 2} = 4", math: "\\lim_{x\\to 2} \\frac{x^{2} - 4}{x - 2} = 4" },
      { latex: "\\lim_{n\\to \\infty} \\left(1+\\frac{1}{n}\\right)^{n} = e", math: "\\lim_{n\\to \\infty} \\left(1+\\frac{1}{n}\\right)^{n} = e" },
      { latex: "\\lim_{x\\to 0} \\frac{e^{x} - 1}{x} = 1", math: "\\lim_{x\\to 0} \\frac{e^{x} - 1}{x} = 1" }
    ]
  },
  level5: {
    simpleMatrix: [
      { latex: "\\begin{pmatrix}1 & 0\\\\0 & 1\\end{pmatrix}", math: "\\begin{pmatrix}1 & 0\\\\0 & 1\\end{pmatrix}" },
      { latex: "\\begin{pmatrix}2 & 3\\\\4 & 5\\end{pmatrix}", math: "\\begin{pmatrix}2 & 3\\\\4 & 5\\end{pmatrix}" }
    ],
    complexMatrix: [
      { latex: "\\begin{pmatrix}a & b\\\\c & d\\end{pmatrix}", math: "\\begin{pmatrix}a & b\\\\c & d\\end{pmatrix}" },
      { latex: "\\begin{pmatrix}1 & 2 & 3\\\\4 & 5 & 6\\\\7 & 8 & 9\\end{pmatrix}", math: "\\begin{pmatrix}1 & 2 & 3\\\\4 & 5 & 6\\\\7 & 8 & 9\\end{pmatrix}" }
    ],
    commonMatrices: [
      { latex: "\\begin{pmatrix}1 & 0\\\\0 & 1\\end{pmatrix}", math: "\\begin{pmatrix}1 & 0\\\\0 & 1\\end{pmatrix}" }, // Identity matrix
      { latex: "\\begin{pmatrix}0 & 0\\\\0 & 0\\end{pmatrix}", math: "\\begin{pmatrix}0 & 0\\\\0 & 0\\end{pmatrix}" }, // Zero matrix
      { latex: "\\sigma_x = \\begin{pmatrix}0 & 1\\\\1 & 0\\end{pmatrix}", math: "\\sigma_x = \\begin{pmatrix}0 & 1\\\\1 & 0\\end{pmatrix}" },
      { latex: "\\sigma_y = \\begin{pmatrix}0 & -i\\\\i & 0\\end{pmatrix}", math: "\\sigma_y = \\begin{pmatrix}0 & -i\\\\i & 0\\end{pmatrix}" },
      { latex: "\\sigma_z = \\begin{pmatrix}1 & 0\\\\0 & -1\\end{pmatrix}", math: "\\sigma_z = \\begin{pmatrix}1 & 0\\\\0 & -1\\end{pmatrix}" }
    ]
  },
  level6: {
    allSkills: [
      { latex: "\\begin{pmatrix}1 & 0\\\\0 & 1\\end{pmatrix}", math: "\\begin{pmatrix}1 & 0\\\\0 & 1\\end{pmatrix}" }
    ]
  },

  forPhysicist: {
    forPhysicistI: [
      { latex: "\\hat{H} = \\sum_{i=1}^{N} \\frac{p_{i}^{2}}{2m} + V(q_{1},\\dots,q_{N})", math: "\\hat{H} = \\sum_{i=1}^{N} \\frac{p_{i}^{2}}{2m} + V(q_{1},\\dots,q_{N})" },
      { latex: "\\hat{H} = \\frac{p^{2}}{2m} + \\frac{1}{2} m\\omega^{2}x^{2}", math: "\\hat{H} = \\frac{p^{2}}{2m} + \\frac{1}{2} m\\omega^{2}x^{2}" },
      { latex: "\\frac{d}{dt}(\\frac{\\partial L}{\\partial \\dot{q}})-\\frac{\\partial L}{\\partial q}=0", math: "\\frac{d}{dt}(\\frac{\\partial L}{\\partial \\dot{q}})-\\frac{\\partial L}{\\partial q}=0" },
      { latex: "L = T-V", math: "L = T-V" },
      { latex: "L = \\frac{1}{2}mv^{2} - mgh", math: "L = \\frac{1}{2}mv^{2} - mgh" },
      { latex: "L = \\frac{1}{2}I\\omega^{2} - U(\\theta)", math: "L = \\frac{1}{2}I\\omega^{2} - U(\\theta)" },
      { latex: "F = -kx", math: "F = -kx" },
      { latex: "U = -\\frac{Gm_{1}m_{2}}{r}", math: "U = -\\frac{Gm_{1}m_{2}}{r}" },
      { latex: "L = r \\times p", math: "L = r \\times p" },
      { latex: "\\frac{\\partial^{2} u}{\\partial t^{2}} = c^{2} \\nabla^{2} u", math: "\\frac{\\partial^{2} u}{\\partial t^{2}} = c^{2} \\nabla^{2} u" },
      { latex: "\\rho\\left(\\frac{d^{2}r}{dt^{2}}\\right)= -\\nabla U", math: "\\rho\\left(\\frac{d^{2}r}{dt^{2}}\\right)= -\\nabla U" },
      { latex: "W = \\Delta K", math: "W = \\Delta K" }
    ],
    forPhysicistII: [
      { latex: "\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\varepsilon_{0}}", math: "\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\varepsilon_{0}}" },
      { latex: "\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}", math: "\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}" },
      { latex: "\\nabla \\cdot \\mathbf{B} = 0", math: "\\nabla \\cdot \\mathbf{B} = 0" },
      { latex: "\\nabla \\times \\mathbf{B} = \\mu_{0} \\mathbf{J} + \\mu_{0}\\varepsilon_{0}\\frac{\\partial \\mathbf{E}}{\\partial t}", math: "\\nabla \\times \\mathbf{B} = \\mu_{0} \\mathbf{J} + \\mu_{0}\\varepsilon_{0}\\frac{\\partial \\mathbf{E}}{\\partial t}" },
      { latex: "\\Delta U = Q - W", math: "\\Delta U = Q - W" },
      { latex: "\\Delta S \\geq 0", math: "\\Delta S \\geq 0" },
      { latex: "PV = nRT", math: "PV = nRT" },
      { latex: "j^{*} = \\sigma T^{4}", math: "j^{*} = \\sigma T^{4}" },
      { latex: "E = mc^{2}", math: "E = mc^{2}" },
      { latex: "\\Delta x\\Delta p \\geq \\frac{\\hbar}{2}", math: "\\Delta x\\Delta p \\geq \\frac{\\hbar}{2}" },
      { latex: "i\\hbar\\frac{\\partial}{\\partial t}\\Psi = \\hat{H}\\Psi", math: "i\\hbar\\frac{\\partial}{\\partial t}\\Psi = \\hat{H}\\Psi" },
      { latex: "\\mathbf{F} = q(\\mathbf{E} + \\mathbf{v}\\times\\mathbf{B})", math: "\\mathbf{F} = q(\\mathbf{E} + \\mathbf{v}\\times\\mathbf{B})" }
    ]
  },
  forMathematicians: {
    forMathematiciansI: [
      { latex: "a^{2}+b^{2}=c^{2}", math: "a^{2}+b^{2}=c^{2}" },
      { latex: "x=-b\\pm\\sqrt{b^{2}-4ac}/2a", math: "x=-b\\pm\\sqrt{b^{2}-4ac}/2a" },
      { latex: "e^{i\\pi}+1=0", math: "e^{i\\pi}+1=0" },
      { latex: "(x+y)^{n}=\\sum_{k=0}^{n}{n\\choose k}x^{n-k}y^{k}", math: "(x+y)^{n}=\\sum_{k=0}^{n}{n\\choose k}x^{n-k}y^{k}" },
      { latex: "f'(x)=\\lim_{h\\to 0}\\frac{f(x+h)-f(x)}{h}", math: "f'(x)=\\lim_{h\\to 0}\\frac{f(x+h)-f(x)}{h}" },
      { latex: "\\frac{d}{dx}\\int_{a}^{x} f(t)dt=f(x)", math: "\\frac{d}{dx}\\int_{a}^{x} f(t)dt=f(x)" },
      { latex: "e^{x}=\\sum_{n=0}^{\\infty}\\frac{x^{n}}{n!}", math: "e^{x}=\\sum_{n=0}^{\\infty}\\frac{x^{n}}{n!}" },
      { latex: "A=\\pi r^{2}", math: "A=\\pi r^{2}" },
      { latex: "C=2\\pi r", math: "C=2\\pi r" },
      { latex: "S_{n}=\\frac{n}{2}(a_{1}+a_{n})", math: "S_{n}=\\frac{n}{2}(a_{1}+a_{n})" },
      { latex: "\\det\\begin{pmatrix}a & b\\\\c & d\\end{pmatrix}=ad-bc", math: "\\det\\begin{pmatrix}a & b\\\\c & d\\end{pmatrix}=ad-bc" },
      { latex: "\\log_{b}(a)=\\frac{\\ln a}{\\ln b}", math: "\\log_{b}(a)=\\frac{\\ln a}{\\ln b}" }
    ],
    forMathematiciansII: [
      { latex: "\\lim_{x\\to 0}\\frac{\\sin x}{x}=1", math: "\\lim_{x\\to 0}\\frac{\\sin x}{x}=1" },
      { latex: "e^{i\\theta}=\\cos\\theta+i\\sin\\theta", math: "e^{i\\theta}=\\cos\\theta+i\\sin\\theta" },
      { latex: "f(x)=\\sum_{n=-\\infty}^{\\infty}c_{n} e^{inx}", math: "f(x)=\\sum_{n=-\\infty}^{\\infty}c_{n} e^{inx}" },
      { latex: "|\\langle u,v\\rangle|\\leq\\|u\\|\\|v\\|", math: "|\\langle u,v\\rangle|\\leq\\|u\\|\\|v\\|" },
      { latex: "f'(c)=\\frac{f(b)-f(a)}{b-a}", math: "f'(c)=\\frac{f(b)-f(a)}{b-a}" },
      { latex: "\\zeta(s)=\\sum_{n=1}^{\\infty}\\frac{1}{n^{s}}", math: "\\zeta(s)=\\sum_{n=1}^{\\infty}\\frac{1}{n^{s}}" },
      { latex: "\\oint_C (L dx+M dy)=\\iint_D \\left(\\frac{\\partial M}{\\partial x}-\\frac{\\partial L}{\\partial y}\\right)dxdy", math: "\\oint_C (Ldx+Mdy)=\\iint_D \\left(\\frac{\\partial M}{\\partial x}-\\frac{\\partial L}{\\partial y}\\right)dxdy" },
      { latex: "\\iiint_{V} (\\nabla\\cdot\\mathbf{F})dV=\\iint_{S} \\mathbf{F}\\cdot d\\mathbf{S}", math: "\\iiint_{V} (\\nabla\\cdot\\mathbf{F})dV=\\iint_{S} \\mathbf{F}\\cdot d\\mathbf{S}" },
      { latex: "\\oint_{C} \\mathbf{F}\\cdot d\\mathbf{r}=\\iint_{S} \\left(\\nabla\\times\\mathbf{F}\\right)\\cdot d\\mathbf{S}", math: "\\oint_{C} \\mathbf{F}\\cdot d\\mathbf{r}=\\iint_{S} \\left(\\nabla\\times\\mathbf{F}\\right)\\cdot d\\mathbf{S}" },
      { latex: "\\mathcal{L}\\{f(t)\\}=\\int_{0}^{\\infty} e^{-st}f(t)dt", math: "\\mathcal{L}\\{f(t)\\}=\\int_{0}^{\\infty} e^{-st}f(t)dt" },
      { latex: "\\sum_{n=1}^{\\infty}\\frac{1}{n^{2}}=\\frac{\\pi^{2}}{6}", math: "\\sum_{n=1}^{\\infty}\\frac{1}{n^{2}}=\\frac{\\pi^{2}}{6}" }
    ]
  }
};



const challengeSublevels = {
  challenge1: [
    { latex: "2", math: "2" }
  ],
  challenge2: [
    { latex: "2", math: "2" }
    // Add additional expressions for challenge2 as needed.
  ],
  challenge3: [
    { latex: "\\frac{3^{2} + x_{1}}{4 + x_{2}}", math: "\\frac{3^{2} + x_{1}}{4 + x_{2}}" },
    { latex: "\\frac{x_{3} - 5^{2}}{x_{4} + 6}", math: "\\frac{x_{3} - 5^{2}}{x_{4} + 6}" },
    { latex: "\\frac{4 + x_{5} \\times 2}{3^{3} - 1}", math: "\\frac{4 + x_{5} \\times 2}{3^{3} - 1}" },
    { latex: "\\frac{x_{6}^{2} - 5}{7 + 2 \\times x_{7}}", math: "\\frac{x_{6}^{2} - 5}{7 + 2 \\times x_{7}}" },
    { latex: "\\frac{2^{4} + x_{8}}{3 + x_{9}}", math: "\\frac{2^{4} + x_{8}}{3 + x_{9}}" }
  ],
  challenge4: [
    { latex: "\\alpha + \\beta - x_{1}", math: "\\alpha + \\beta - x_{1}" },
    { latex: "\\gamma \\times x_{2} + \\delta^{2}", math: "\\gamma \\times x_{2} + \\delta^{2}" },
    { latex: "\\frac{\\theta + x_{3}^{2}}{\\omega - 4}", math: "\\frac{\\theta + x_{3}^{2}}{\\omega - 4}" },
    { latex: "\\sigma \\times \\lambda - x_{4} + \\mu", math: "\\sigma \\times \\lambda - x_{4} + \\mu" },
    { latex: "\\pi + \\phi - x_{5}", math: "\\pi + \\phi - x_{5}" }
  ],
  challenge5: [
    { latex: "\\int x^{2} dx", math: "\\int x^{2} dx" },
    { latex: "\\int (x_{1} + 3) dx", math: "\\int (x_{1} + 3) dx" },
    { latex: "\\int (\\alpha x^{2} + \\beta) dx", math: "\\int (\\alpha x^{2} + \\beta) dx" },
    { latex: "\\int (x + 1) dx", math: "\\int (x + 1) dx" },
    { latex: "\\int (2x - 5) dx", math: "\\int (2x - 5) dx" }
  ],
  challenge6: [
    { latex: "\\int_{0}^{5} x^{3} dx", math: "\\int_{0}^{5} x^{3} dx" },
    { latex: "\\int_{1}^{4} (x^{2} + 2) dx", math: "\\int_{1}^{4} (x^{2} + 2) dx" },
    { latex: "\\int_{-2}^{3} (\\alpha x + \\beta) dx", math: "\\int_{-2}^{3} (\\alpha x + \\beta) dx" },
    { latex: "\\int_{0}^{1} (3x^{2} - 2x + 1) dx", math: "\\int_{0}^{1} (3x^{2} - 2x + 1) dx" },
    { latex: "\\int_{-1}^{2} (x^{3} + x) dx", math: "\\int_{-1}^{2} (x^{3} + x) dx" }
  ],
  challenge7: [
    { latex: "\\sum x_{n}", math: "\\sum x_{n}" },
    { latex: "\\sum (x_{1} + x_{2}^{2})", math: "\\sum (x_{1} + x_{2}^{2})" },
    { latex: "\\sum_{n=1}^{10} (3n + x_{n})", math: "\\sum_{n=1}^{10} (3n + x_{n})" },
    { latex: "\\sum_{n=0}^{5} (n^{2} - x_{n})", math: "\\sum_{n=0}^{5} (n^{2} - x_{n})" },
    { latex: "\\sum_{k=1}^{n} (2k + x_{k})", math: "\\sum_{k=1}^{n} (2k + x_{k})" }
  ],
  challenge8: [
    { latex: "\\sum_{n=1}^{5} x_{n} + \\frac{3}{4}", math: "\\sum_{n=1}^{5} x_{n} + \\frac{3}{4}" },
    { latex: "\\sum_{k=0}^{n} \\frac{k^{2}}{x_{k}}", math: "\\sum_{k=0}^{n} \\frac{k^{2}}{x_{k}}" },
    { latex: "\\sum_{n=1}^{10} \\frac{x_{n} + 2}{n}", math: "\\sum_{n=1}^{10} \\frac{x_{n} + 2}{n}" },
    { latex: "\\sum_{k=1}^{5} \\frac{2k - 1}{x_{k}}", math: "\\sum_{k=1}^{5} \\frac{2k - 1}{x_{k}}" },
    { latex: "\\sum_{n=0}^{3} \\frac{3n + 1}{x_{n}}", math: "\\sum_{n=0}^{3} \\frac{3n + 1}{x_{n}}" }
  ],
  challenge9: [
    { latex: "\\int_{0}^{\\pi} \\sin x dx", math: "\\int_{0}^{\\pi} \\sin x dx" },
    { latex: "\\sum_{n=1}^{\\infty} \\frac{1}{n^{2}}", math: "\\sum_{n=1}^{\\infty} \\frac{1}{n^{2}}" },
    { latex: "\\int_{0}^{\\pi} \\cos x dx", math: "\\int_{0}^{\\pi} \\cos x dx" },
    { latex: "\\int_{0}^{1} e^{x} dx", math: "\\int_{0}^{1} e^{x} dx" },
    { latex: "\\sum_{n=1}^{\\infty} \\frac{(-1)^{n}}{n}", math: "\\sum_{n=1}^{\\infty} \\frac{(-1)^{n}}{n}" }
  ],
  challenge10: [
    { latex: "\\oint_{C} (y dx - x dy)", math: "\\oint_{C} (y dx - x dy)" },
    { latex: "\\lim_{x \\to 2} \\frac{x^{2} - 4}{x - 2}", math: "\\lim_{x \\to 2} \\frac{x^{2} - 4}{x - 2}" },
    { latex: "\\lim_{x \\to \\infty} \\frac{2x+3}{x-1}", math: "\\lim_{x \\to \\infty} \\frac{2x+3}{x-1}" },
    { latex: "\\oint_{C} \\frac{dx}{x}", math: "\\oint_{C} \\frac{dx}{x}" },
    { latex: "\\lim_{x \\to 0} \\frac{\\sin x}{x}", math: "\\lim_{x \\to 0} \\frac{\\sin x}{x}" }
  ]
};

const completedSublevels = {
  level1: {
    additionSubtraction: false,
    multiplicationDivision: false,
    exponentsSubscripts: false,
    checkpoint1: false,
    fractions: false,
    checkpoint2: false
  },
  level2: {
    greekIntroduction: false,
    greekExpressions: false
  },
  level3: {
    simpleIntegrals: false,
    doubleIntegralsGreek: false,
    contourIntegrals: false,
    complexIntegrals: false
  },
  level4: {
    basicSum: false,
    complexSums: false
  },
  level5: {
    simpleMatrix: false,
    complexMatrix: false,
    commonMatrices: false
  },
  level6: {
    allSkills: false
  },
  forPhysicist: {
    forPhysicistI: false,
    forPhysicistII: false
  },
  forMathematicians: {
    forMathematiciansI: false,
    forMathematiciansII: false
  }
};

const completedChallenges = {
  challenge1: false,
  challenge2: false,
  challenge3: false,
  challenge4: false,
  challenge5: false,
  challenge6: false,
  challenge7: false,
  challenge8: false,
  challenge9: false,
  challenge10: false
};

// ==================================================
// Global Variables for Mode State
// ==================================================

// Tutorial Mode questions
const tutorialQuestions = [
  { latex: "1+3", math: "1+3" },
  { latex: "2\\times5", math: "2\\times5" },
  { latex: "\\frac{1}{2}", math: "\\frac{1}{2}" },
  { latex: "\\int_{0}^{1} x^{2}", math:"\\int_{0}^{1} x^{2}"}
];
// Separate indices for tutorial and challenge modes:
let tutorialIndex = 0;
let challengeIndex = 0; // Challenge mode now uses its own index

// Global variables for other modes
let currentIndex = 0; // used in learning and endless modes
let currentLevel = '';
let currentSubLevel = '';
let currentChallenge = '';
let currentExpression = ''; // For Endless mode
// currentMode can be "learning", "challenge", "endless", or "tutorial"
let currentMode = "";
let endlessStreak = 0;

// ==================================================
// New Global Variables and Functions for Tutorial Tips
// ==================================================
let tutorialMultiplicationTipShown = false;
let tutorialFractionTipShown = false;

function positionTutorialTip() {
  const inputField = document.getElementById("inputField");
  const tutorialTip = document.getElementById("tutorialTip");
  if (inputField && tutorialTip) {
    const rect = inputField.getBoundingClientRect();
    // Ensure the tip is already visible (or force a display to get its width)
    // This positions the tip to the left of the input field.
    const tipWidth = tutorialTip.offsetWidth;
    tutorialTip.style.left = (rect.left - tipWidth - 20 + window.scrollX) + "px";
    // Vertically center the tip relative to the input field
    tutorialTip.style.top = (rect.top + window.scrollY + rect.height / 2 - 150) + "px";
  }
}

function updateTutorialTip() {
  const tipElem = document.getElementById("tutorialTip");
  if (!tipElem) return;
  
  if (tutorialIndex === 0) {
    tipElem.innerText = "LaTeX is a language that lets you write complex math symbols. This one is easy though—these symbols are on your keyboard. Just type them in!";
    tipElem.style.display = "block";
  } else if (tutorialIndex === 1) {
    tipElem.innerText = "The multiplication symbol isn’t on your keyboard, so use the special syntax. Hover over the symbol in the question to see the syntax for it.";
    tipElem.style.display = "block";
  } else if (tutorialIndex === 2) {
    tipElem.innerText = "Fractions are trickier. Hover to see the syntax! When you see curly brackets { }, we usually type inside them.";
    tipElem.style.display = "block";
  } else if (tutorialIndex === 3) {  // New tutorial step
    tipElem.innerText = "Really stuck? Click 'Show Guide' to see the syntax for the question so you can type along!";
    tipElem.style.display = "block";
  } else {
    tipElem.style.display = "none";
  }
  
  positionTutorialTip();
  
  tipElem.classList.add("animate-tip");
  setTimeout(() => {
    tipElem.classList.remove("animate-tip");
  }, 600);
}




window.addEventListener("resize", positionTutorialTip);


// ==================================================
// Preload sounds
// ==================================================
const correctSound = new Audio('correct-sound.mp3');
correctSound.load();
function playCorrectSound() {
  correctSound.currentTime = 0;
  correctSound.play().catch(err => console.log("Error playing correct sound:", err));
}
const achievementSound = new Audio('achievement-sound.mp3');
achievementSound.load();
// playAchievementSound() is defined above

// ==================================================
// Additional Utility Functions
// ==================================================
function loadProgress() {
  // (Optional function if needed for other progress; using loadLearningProgress below)
}

function loadDarkMode() {
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
}

// ==================================================
// Rendering & Interaction Functions
// ==================================================
// ==================================================
// Update Sublevel and Level Completion Display
// ==================================================

// Updates the sublevel buttons in the sublevel screen.
function updateSublevelCompletion() {
  const buttons = document.querySelectorAll(".sublevel-btn");
  buttons.forEach(button => {
    const sub = button.getAttribute("data-sublevel");
    if (completedSublevels[currentLevel] && completedSublevels[currentLevel][sub]) {
      button.classList.add("completed");
      if (!button.textContent.includes("✓")) { 
        button.textContent += " ✓";
      }
    } else {
      button.classList.remove("completed");
      button.textContent = button.textContent.replace(" ✓", "");
    }
  });
}

// Updates the level buttons on the learning level screen.
// If every sublevel for a given level is complete, mark that level button as completed.
function updateLevelCompletion() {
  document.querySelectorAll(".level-btn").forEach(button => {
    const level = button.getAttribute("data-level");
    const sublevels = allSublevels[level];
    if (!sublevels) return;
    
    // Check if every sublevel in this level is completed.
    const allCompleted = Object.keys(sublevels).every(sublevel => completedSublevels[level][sublevel]);
    if (allCompleted) {
      button.classList.add("completed");
      if (!button.textContent.includes("✓")) {
        button.textContent += " ✓";
      }
    } else {
      button.classList.remove("completed");
      button.textContent = button.textContent.replace(" ✓", "");
    }
  });
}

// ==================================================
// Full checkAnswer() Implementation
// ==================================================
function checkAnswer() {
  const inputField = document.getElementById("inputField");
  const input = normalizeInput(inputField.value);
  let correctLatex = "";

  if (currentMode === "challenge") {
    correctLatex = normalizeInput(challengeSublevels[currentChallenge][challengeIndex].latex);
  } else if (currentMode === "learning") {
    if (currentSubLevel) {
      correctLatex = normalizeInput(allSublevels[currentLevel][currentSubLevel][currentIndex].latex);
    }
  } else if (currentMode === "endless") {
    correctLatex = normalizeInput(currentExpression.latex);
  } else if (currentMode === "tutorial") {
    correctLatex = normalizeInput(tutorialQuestions[tutorialIndex].latex);
  }

  if (input === correctLatex) {

    // Auto-hide the guide if it's active.
    if (inputField.hasAttribute("data-guide")) {
      inputField.removeAttribute("data-guide");
      inputField.classList.remove("guide-active");
      document.getElementById("showGuideBtn").textContent = "Show Guide";
    }

    // Clear the input field and update overlay.
    inputField.value = "";
    updateOverlay();

    // Reset placeholder text so it appears for the next question.
    inputField.setAttribute("placeholder", "Type LaTeX syntax here...");

    playCorrectSound();

    if (currentMode === "endless") {
      endlessStreak++;
      updateProgress();
      
      const bestStreak = loadBestEndlessStreak();
      if (endlessStreak > bestStreak) {
        saveBestEndlessStreak(endlessStreak);
      }
      if (endlessStreak === 5) { unlockAchievement("endless5InRow"); }
      if (endlessStreak === 10) { unlockAchievement("endless10InRow"); }
      flashElement(inputField, "#66e385");
      nextEndlessQuestion();
      return;
    } else if (currentMode === "tutorial") {
      if (tutorialIndex === tutorialQuestions.length - 1) {
        document.getElementById("tutorialTip").innerText = "Amazing, you're ready for Learning Mode!";
        triggerConfetti();
        unlockAchievement("graduatedLatexKindergarten");
        showTimerPopup("Tutorial complete!");
        document.getElementById("tutorInterface").style.display = "none";
        document.getElementById("modeSelectionScreen").style.display = "flex";
        tutorialIndex = 0;
        resetInputAndPreview();
        return;
      } else {
        tutorialIndex++;
        if (tutorialIndex === 1) tutorialMultiplicationTipShown = false;
        if (tutorialIndex === 2) tutorialFractionTipShown = false;
      }
    } else if (currentMode === "challenge") {
      const questions = challengeSublevels[currentChallenge];
      if (challengeIndex === questions.length - 1) {
        completedChallenges[currentChallenge] = true;
        saveChallengeProgress();
        triggerConfetti();
        resetInputAndPreview();
        updateChallengeCompletion();
        stopChallengeTimer();

        const timeText = document.getElementById("timerDisplay").textContent;
        const [min, sec] = timeText.split(":").map(Number);
        const elapsedSeconds = min * 60 + sec;
        saveBestTime(currentChallenge, elapsedSeconds);

        if (elapsedSeconds < 60) {
          unlockAchievement("challengeUnder1");
          unlockAchievement("challengeUnder2");
        } else if (elapsedSeconds < 120) {
          unlockAchievement("challengeUnder2");
        }

        if (Object.values(completedChallenges).every(val => val)) {
          unlockAchievement("finishChallenge");
        }

        checkAllChallengeAchievements();
        showTimerPopup(`Challenge complete! Your time: ${timeText}`);
        document.getElementById("tutorInterface").style.display = "none";
        document.getElementById("challengeSublevelScreen").style.display = "flex";
        challengeIndex = 0;
        return;
      } else {
        challengeIndex++;
      }
    } else { // Learning Mode
      const questions = allSublevels[currentLevel][currentSubLevel];
      if (currentIndex === questions.length - 1) {
        completedSublevels[currentLevel][currentSubLevel] = true;
        saveLearningProgress();
        document.getElementById("tutorInterface").style.display = "none";
        document.getElementById("sublevelScreen").style.display = "flex";
        triggerConfetti();
        resetInputAndPreview();
        updateSublevelCompletion();
        updateLevelCompletion();

        if (currentLevel === "forPhysicist" && Object.values(completedSublevels.forPhysicist).every(val => val)) {
          unlockAchievement("finishPhysicist");
        }
        if (currentLevel === "forMathematicians" && Object.values(completedSublevels.forMathematicians).every(val => val)) {
          unlockAchievement("finishMathematicians");
        }
        if (allSublevelsCompleted()) { unlockAchievement("finishLearning"); }
        currentIndex = 0;
        resetInputAndPreview();
        return;
      } else {
        currentIndex++;
      }
    }
    resetInputAndPreview();
    renderMath();
    flashElement(inputField, "#66e385");
  } else {
    if (currentMode === "endless") {
      endlessStreak = 0;
      updateProgress();
    }
    shakeElement(inputField);
  }
}


function showTimerPopup(message) {
  const popup = document.createElement("div");
  popup.className = "info-popup";
  popup.innerText = message;
  popup.style.opacity = "1";
  document.body.appendChild(popup);
  setTimeout(() => { popup.style.opacity = "0"; }, 6000);
  setTimeout(() => { popup.remove(); }, 7000);
}

function resetInputAndPreview() {
  document.getElementById("inputField").value = '';
  document.getElementById("preview").innerHTML = '';
}

function updateProgress() {
  const container = document.getElementById("progress-container");
  if (container) {
    container.style.display = "block";
  }
  
  if (currentMode === "endless") {
    document.getElementById("progress-bar").style.width = "100%";
    document.getElementById("progress-text").textContent =
      "Endless Mode - Current Streak: " + endlessStreak;
    return;
  }
  let totalQuestions = 0;
  let indexForDisplay = 0;
  
  if (currentMode === "challenge") {
    totalQuestions = challengeSublevels[currentChallenge].length;
    indexForDisplay = challengeIndex;
  } else if (currentMode === "tutorial") {
    totalQuestions = tutorialQuestions.length;
    indexForDisplay = tutorialIndex;
  } else if (currentSubLevel) {
    totalQuestions = allSublevels[currentLevel][currentSubLevel].length;
    indexForDisplay = currentIndex;
  }
  
  if (!totalQuestions) return;
  
  const progressPercentage = ((indexForDisplay + 1) / totalQuestions) * 100;
  document.getElementById("progress-bar").style.width = `${progressPercentage}%`;
  document.getElementById("progress-text").innerText = `Progress: ${indexForDisplay + 1} / ${totalQuestions}`;
}







function flashElement(element, color) {
  // Check if the element is already flashing
  if (element.classList.contains("flash-active")) return;
  
  element.classList.add("flash-active");
  element.style.backgroundColor = color;
  
  setTimeout(() => {
    element.style.backgroundColor = "";
    element.classList.remove("flash-active");
  }, 500);
}


function triggerConfetti() {
  console.log("Confetti triggered!");
  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
}

function shakeElement(element) {
  element.classList.add("shake-input");
  setTimeout(() => { element.classList.remove("shake-input"); }, 500);
}

// ==================================================
// LaTeX Tokenization & Rendering Functions
// ==================================================
function tokenizeLatex(input) {
  const tokens = [];
  let i = 0;
  
  function readCommand() {
    let command = '\\';
    i++;
    // If the next character is not a letter, add it and return.
    if (i < input.length && !/[a-zA-Z]/.test(input[i])) {
      command += input[i];
      i++;
      return command;
    }
    while (i < input.length && /[a-zA-Z]/.test(input[i])) {
      command += input[i];
      i++;
    }
    // If the command is \left or \right, immediately capture its delimiter.
    if ((command === "\\left" || command === "\\right") && i < input.length) {
      if (input[i] === '\\') {
        let delim = '\\';
        i++;
        while (i < input.length && /[a-zA-Z]/.test(input[i])) {
          delim += input[i];
          i++;
        }
        command += delim;
      } else {
        command += input[i];
        i++;
      }
    }
    
    // Handle commands that require an immediate group argument.
    if ((["\\hat", "\\mathbf", "\\text", "\\sqrt", "\\mathcal"].includes(command)) && input[i] === '{') {
      command += readGroup();
    }
    // Handle operators that may have superscripts/subscripts attached.
    if (["\\sum", "\\iint", "\\oint", "\\int", "\\lim", "\\iiint"].includes(command)) {
      while (i < input.length && (input[i] === '^' || input[i] === '_')) {
        const op = input[i++];
        let part = "";
        if (input[i] === '{') { 
          part = readGroup(); 
        } else { 
          part = input[i++];
        }
        command += op + part;
      }
    }
    return command;
  }
  
  function readGroup() {
    let group = '{';
    i++;
    let braceCount = 1;
    while (i < input.length && braceCount > 0) {
      if (input[i] === '{') { braceCount++; }
      else if (input[i] === '}') { braceCount--; }
      group += input[i];
      i++;
    }
    return group;
  }
  
  function readFractionComponent() {
    while (i < input.length && /\s/.test(input[i])) { i++; }
    if (input[i] === '{') return readGroup();
    else { 
      let token = input[i]; 
      i++; 
      return token; 
    }
  }
  
  while (i < input.length) {
    if (/\s/.test(input[i])) { 
      i++; 
      continue; 
    }
    // Check if a matrix environment starts here.
    if (input.slice(i).startsWith("\\begin{pmatrix}")) {
      let matrixToken = "";
      const endMarker = "\\end{pmatrix}";
      while (i < input.length && !input.slice(i).startsWith(endMarker)) {
        matrixToken += input[i];
        i++;
      }
      if (input.slice(i).startsWith(endMarker)) {
        matrixToken += endMarker;
        i += endMarker.length;
      }
      tokens.push(matrixToken);
      continue;
    }
    if (input[i] === '\\') {
      const command = readCommand();
      if (command.startsWith('\\frac')) {
        const num = readFractionComponent();
        const denom = readFractionComponent();
        tokens.push(command + num + denom);
      } else { 
        tokens.push(command); 
      }
      continue;
    }
    if (input[i] === '{') { 
      tokens.push(readGroup()); 
      continue; 
    }
    if (input[i] === '^' || input[i] === '_') {
      const op = input[i]; 
      i++;
      let nextToken = '';
      if (input[i] === '{') { 
        nextToken = readGroup(); 
      } else { 
        nextToken = input[i]; 
        i++; 
      }
      tokens.push(op + nextToken);
      continue;
    }
    if (["+","-","="].includes(input[i])) { 
      tokens.push(input[i]); 
      i++; 
      continue; 
    }
    let other = '';
    while (i < input.length && !/[\s\\{}^_+\-=]/.test(input[i])) {
      other += input[i];
      i++;
    }
    if (other) { 
      tokens.push(other); 
    }
  }
  return tokens;
}

function groupTokens(tokens) {
  const grouped = [];
  let i = 0;
  while (i < tokens.length) {
    let token = tokens[i];
    // If token starts with \left, group tokens until \right is found.
    if (token.startsWith("\\left")) {
      let group = token;
      i++;
      while (i < tokens.length && !tokens[i].startsWith("\\right")) {
        group += tokens[i];
        i++;
      }
      // Append the token that starts with \right, if it exists.
      if (i < tokens.length && tokens[i].startsWith("\\right")) {
        group += tokens[i];
        i++;
      }
      grouped.push(group);
    } else {
      grouped.push(token);
      i++;
    }
  }
  return grouped;
}


function renderMath() {
  const mathContainer = document.getElementById("math-display-container");
  // Clear previous content.
  mathContainer.innerHTML = "";

  // Helper to create a token element with common event handlers.
  function renderToken(token, custom = false) {
    const tokenEl = document.createElement("span");
    tokenEl.className = "token";
    // Use display style for certain operators.
    if (
      token.startsWith("\\sum") ||
      token.startsWith("\\iint") ||
      token.startsWith("\\oint") ||
      token.startsWith("\\int") ||
      token.startsWith("\\lim") ||
      token.startsWith("\\iiint")
    ) {
      tokenEl.innerHTML = `\\(\\displaystyle ${token}\\)`;
    } else {
      tokenEl.innerHTML = `\\(${token}\\)`;
    }
    // Attach default mouse events unless custom behavior is provided.
    if (!custom) {
      tokenEl.addEventListener("mouseover", () => {
        document.getElementById("syntaxHintContainer").textContent = getShell(token) || token;
      });
      tokenEl.addEventListener("mouseout", () => {
        document.getElementById("syntaxHintContainer").textContent = "";
      });
    }
    tokenEl.addEventListener("click", () => {
      document.getElementById("inputField").value += token;
      updatePreview();
    });
    return tokenEl;
  }

  // Helper for tokens needing custom behavior (e.g. tutorial mode).
  function renderTokenWithHandler(token, handler) {
    const tokenEl = renderToken(token, true);
    handler(token, tokenEl);
    return tokenEl;
  }

  // Helper to create a matrix token element.
  function createMatrixToken(mathStr) {
    const tokenEl = document.createElement("span");
    tokenEl.className = "token";
    tokenEl.innerHTML = `\\(${mathStr}\\)`;
    tokenEl.addEventListener("mouseover", () => {
      document.getElementById("syntaxHintContainer").textContent = getShell(mathStr) || mathStr;
    });
    tokenEl.addEventListener("mouseout", () => {
      document.getElementById("syntaxHintContainer").textContent = "";
    });
    tokenEl.addEventListener("click", () => {
      document.getElementById("inputField").value += mathStr;
      updatePreview();
    });
    return tokenEl;
  }

  // Render an expression: if it’s a matrix, render it as a whole;
  // otherwise, tokenize and render each token. An optional handler
  // can override the default token events.
  function renderExpression(expr, tokenHandler) {
      let tokens = tokenizeLatex(expr.math);
      tokens = groupTokens(tokens);
      tokens.forEach(token => {
        const tokenEl = tokenHandler
          ? renderTokenWithHandler(token, tokenHandler)
          : renderToken(token);
        mathContainer.appendChild(tokenEl);
      });
   
    MathJax.typesetPromise();
  }

  // Now choose which expression to render based on the mode.
  if (currentMode === "endless") {
    if (currentExpression) {
      renderExpression(currentExpression);
    }
  } else if (currentMode === "challenge") {
    const expr = challengeSublevels[currentChallenge][challengeIndex];
    if (expr) {
      renderExpression(expr);
      updateProgress();
    }
  } else if (currentMode === "tutorial") {
    const expr = tutorialQuestions[tutorialIndex];
    if (expr) {
      // In tutorial mode, pass in a custom token handler.
      renderExpression(expr, (token, tokenEl) => {
        tokenEl.addEventListener("mouseover", () => {
          const tipElem = document.getElementById("tutorialTip");
          if (tutorialIndex === 1 && token === "\\times" && !tutorialMultiplicationTipShown) {
            tipElem.innerText = "Nice! Now we know we can write the multiplication symbol with \\times. Write 2 \\times 5.";
            tipElem.style.display = "block";
            tipElem.classList.add("animate-tip");
            setTimeout(() => { tipElem.classList.remove("animate-tip"); }, 600);
            tutorialMultiplicationTipShown = true;
          } else if (tutorialIndex === 2 && token.startsWith("\\frac") && !tutorialFractionTipShown) {
            tipElem.innerText = "Cool, now we know \\frac{}{} is how we write a fraction, write \\frac{1}{2}.";
            tipElem.style.display = "block";
            tipElem.classList.add("animate-tip");
            setTimeout(() => { tipElem.classList.remove("animate-tip"); }, 600);
            tutorialFractionTipShown = true;
          } else {
            document.getElementById("syntaxHintContainer").textContent = getShell(token) || token;
          }
        });
        tokenEl.addEventListener("mouseout", () => {
          document.getElementById("syntaxHintContainer").textContent = "";
        });
      });
      updateProgress();
      updateTutorialTip();
    }
  } else if (currentMode === "learning" && currentSubLevel) {
    const expr = allSublevels[currentLevel][currentSubLevel][currentIndex];
    if (expr) {
      renderExpression(expr);
      updateProgress();
    }
  }
}

function normalizeInput(input) {
  input = input.replace(/\s+/g, '')
               .replace(/\{\s*/g, '{')
               .replace(/\s*\}/g, '}')
               .replace(/\\\\times/g, '\\\\times');
  input = input.replace(/(\\(?:int|iint|sum))(\^{[^}]+})(_\{[^}]+\})/g, '$1$3$2');
  return input;
}

function updatePreview() {
  const input = document.getElementById("inputField").value.trim();
  document.getElementById("preview").innerHTML = `\\[${input}\\]`;
  MathJax.typesetPromise();
}

function handleKeyPress(event) {
  if (event.key === 'Enter') checkAnswer();
}

// ==================================================
// Learning Mode Sublevel Screen Functions
// ==================================================
function formatChallengeName(key) {
  const mapping = {
    challenge1: "Challenge 1",
    challenge2: "Challenge 2",
    challenge3: "Challenge 3",
    challenge4: "Challenge 4",
    challenge5: "Challenge 5",
    challenge6: "Challenge 6",
    challenge7: "Challenge 7",
    challenge8: "Challenge 8",
    challenge9: "Challenge 9",
    challenge10: "Challenge 10"
  };
  return mapping[key] || key;
}

// ==================================================
// Utility Function: formatSublevelName()
// Returns a nicely formatted string for a sublevel key.
// ==================================================
function formatSublevelName(name) {
  const formattedNames = {
    additionSubtraction: "Addition & Subtraction",
    multiplicationDivision: "Multiplication & Division",
    exponentsSubscripts: "Exponents & Subscripts",
    checkpoint1: "Checkpoint 1",
    fractions: "Fractions",
    checkpoint2: "Checkpoint 2",
    greekIntroduction: "Greek Letters",
    greekExpressions: "Greek Letters II",
    simpleIntegrals: "Simple Integrals",
    doubleIntegralsGreek: "Integrals",
    contourIntegrals: "Contour Integrals",
    complexIntegrals: "Complex Integrals",
    basicSum: "Sums I",
    complexSums: "Sums II",
    limits: "Limits",
    simpleMatrix: "Matrices",
    complexMatrix: "Matrices II",
    commonMatrices: "Common Matrices",
    allSkills: "All Skills",
    // New advanced sublevels for Physicists and Mathematicians:
    forPhysicistI: "For The Physicists I",
    forPhysicistII: "For The Physicists II",
    forMathematiciansI: "For The Mathematicians I",
    forMathematiciansII: "For The Mathematicians II",
    // Fallback mappings for legacy keys (if needed)
    hamiltonian: "Hamiltonians",
    kinematics: "Kinematics",
    braket: "Braket Notation",
    calculus: "Calculus",
    algebra: "Algebra",
    geometry: "Geometry"
  };
  return formattedNames[name] || name;
}
function updateCurrentStreakDisplay() {
  const currentStreakEl = document.getElementById("currentStreakDisplay");
  if (currentStreakEl) {
    currentStreakEl.textContent = endlessStreak;
  }
}

function populateSublevelScreen() {
  console.log("Current level selected:", currentLevel);
  const sublevelsForLevel = allSublevels[currentLevel];
  console.log("Sublevels for current level:", sublevelsForLevel);
  if (!sublevelsForLevel) {
    console.error("No sublevels found for:", currentLevel);
    return;
  }
  const container = document.getElementById("sublevelButtons");
  container.innerHTML = "";
  const keys = Object.keys(sublevelsForLevel);
  console.log("Keys:", keys);
  keys.forEach(sub => {
    const btn = document.createElement("button");
    btn.classList.add("sublevel-btn");
    btn.setAttribute("data-sublevel", sub);
    let btnText = formatSublevelName(sub);
    if (completedSublevels[currentLevel] && completedSublevels[currentLevel][sub]) {
      btn.classList.add("completed");
      btnText += " ✓";
    }
    btn.textContent = btnText;
    btn.addEventListener("click", () => {
      currentSubLevel = btn.getAttribute("data-sublevel");
      currentIndex = 0;
      document.getElementById("sublevelScreen").style.display = "none";
      document.getElementById("tutorInterface").style.display = "flex";
      renderMath();
    });
    container.appendChild(btn);
  });
}

function updateSublevelCompletion() {
  const buttons = document.querySelectorAll(".sublevel-btn");
  buttons.forEach(button => {
    const sub = button.getAttribute("data-sublevel");
    if (completedSublevels[currentLevel] && completedSublevels[currentLevel][sub]) {
      button.classList.add("completed");
      if (!button.textContent.includes("✓")) { 
        button.textContent += " ✓";
      }
    } else {
      button.classList.remove("completed");
      button.textContent = button.textContent.replace(" ✓", "");
    }
  });
}
function updateLevelCompletion() {
  document.querySelectorAll(".level-btn").forEach(button => {
    const level = button.getAttribute("data-level");
    const sublevels = allSublevels[level];
    if (!sublevels) return;

    // Check if every sublevel in the level is completed.
    const allCompleted = Object.keys(sublevels).every(sublevel => completedSublevels[level][sublevel]);
    if (allCompleted) {
      button.classList.add("completed");
      if (!button.textContent.includes("✓")) {
        button.textContent += " ✓";
      }
    } else {
      button.classList.remove("completed");
      button.textContent = button.textContent.replace(" ✓", "");
    }
  });
}

// Open Achievements Modal
document.getElementById("achievementsBtn").addEventListener("click", () => {
  document.getElementById("achievementsModal").style.display = "block";
});

// Close Achievements Modal when clicking the close icon
document.getElementById("closeAchievements").addEventListener("click", () => {
  document.getElementById("achievementsModal").style.display = "none";
});

// ==================================================
// Challenge Mode: Check for All Challenge Achievements
// ==================================================
function checkAllChallengeAchievements() {
  let bestTimes = JSON.parse(localStorage.getItem("bestTimes")) || {};
  let allUnder5 = Object.keys(challengeSublevels).every(challenge =>
    bestTimes[challenge] && bestTimes[challenge] < 300
  );
  if (allUnder5) { unlockAchievement("challengeAllUnder5"); }
  let allUnder3 = Object.keys(challengeSublevels).every(challenge =>
    bestTimes[challenge] && bestTimes[challenge] < 180
  );
  if (allUnder3) { unlockAchievement("challengeAllUnder3"); }
}

// ==================================================
// Endless Mode: Start & Next Question
// ==================================================
function startEndlessMode() {
  currentMode = "endless";
  endlessStreak = 0;
  document.getElementById("tutorInterface").style.display = "flex";
  // Force the progress elements to be visible.
  const progressText = document.getElementById("progress-text");
  const progressBar = document.getElementById("progress-bar");
  if (progressText) progressText.style.display = "block";
  if (progressBar) progressBar.style.display = "block";
  updateProgress();  // Ensure updateProgress is called.
  nextEndlessQuestion();
}


function nextEndlessQuestion() {
  currentExpression = generateExpression();
  renderMath();
  resetInputAndPreview();
}

// ==================================================
// Challenge Mode Completion Functions
// ==================================================
function updateChallengeCompletion() {
  document.querySelectorAll(".challenge-btn").forEach(button => {
    const key = button.getAttribute("data-challenge");
    const displayName = formatChallengeName(key);
    const isCompleted = completedChallenges[key];
    
    if (isCompleted) {
      button.classList.add("completed");
    } else {
      button.classList.remove("completed");
    }
    
    button.innerHTML = "";
    
    const displaySpan = document.createElement("span");
    displaySpan.className = "display-name";
    displaySpan.textContent = displayName + (isCompleted ? " ✓" : "");
    
    let bestTimes = JSON.parse(localStorage.getItem("bestTimes")) || {};
    const bestTimeText = (bestTimes[key] !== undefined ? bestTimes[key] + "s" : "--");
    const bestTimeSpan = document.createElement("span");
    bestTimeSpan.className = "best-time";
    bestTimeSpan.style.display = "block";
    bestTimeSpan.style.fontSize = "0.8rem";
    bestTimeSpan.textContent = "Best: " + bestTimeText;
    
    button.appendChild(displaySpan);
    button.appendChild(bestTimeSpan);
  });
}

// ==================================================
// Timer Functions for Challenge Mode
// ==================================================
let challengeStartTime;
let challengeTimerInterval;
function startChallengeTimer() {
  challengeStartTime = Date.now();
  document.getElementById("challengeTimer").style.display = "block";
  challengeTimerInterval = setInterval(() => {
    const elapsed = Date.now() - challengeStartTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    document.getElementById("timerDisplay").textContent =
      `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, 1000);
}
function stopChallengeTimer() {
  clearInterval(challengeTimerInterval);
  document.getElementById("challengeTimer").style.display = "none";
}

// ==================================================
// Best Time Functions
// ==================================================
function saveBestTime(challenge, time) {
  let bestTimes = JSON.parse(localStorage.getItem("bestTimes")) || {};
  if (!bestTimes[challenge] || time < bestTimes[challenge]) {
    bestTimes[challenge] = time;
    localStorage.setItem("bestTimes", JSON.stringify(bestTimes));
  }
  loadBestTimes();
}
function loadBestTimes() {
  let bestTimes = JSON.parse(localStorage.getItem("bestTimes")) || {};
  document.querySelectorAll(".challenge-btn").forEach(button => {
    let challenge = button.getAttribute("data-challenge");
    let time = (bestTimes[challenge] !== undefined ? bestTimes[challenge] + "s" : "--");
    let bestTimeSpan = button.querySelector(".best-time");
    if (!bestTimeSpan) {
      bestTimeSpan = document.createElement("span");
      bestTimeSpan.className = "best-time";
      bestTimeSpan.style.display = "block";
      bestTimeSpan.style.fontSize = "0.8rem";
      button.appendChild(bestTimeSpan);
    }
    bestTimeSpan.textContent = "Best: " + time;
  });
}
function displayBestTime(challenge) {
  let bestTimes = JSON.parse(localStorage.getItem("bestTimes")) || {};
  let bestTime = bestTimes[challenge] ? bestTimes[challenge] + "s" : "--";
  let displayEl = document.getElementById("bestTimesDisplay");
  if (displayEl) {
    displayEl.textContent = "Best Time: " + bestTime;
  }
}

// ==================================================
// Big Operator & Expression Generators
// ==================================================
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomNumber() {
  return String(Math.floor(Math.random() * 10) + 1);
}
function randomLetter() {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  return letters[Math.floor(Math.random() * letters.length)];
}
function randomGreek() {
  const greeks = ["\\alpha", "\\beta", "\\gamma", "\\delta", "\\epsilon", "\\theta", "\\lambda", "\\mu"];
  return randomChoice(greeks);
}
function generateSimpleToken() {
  return randomChoice([randomLetter, randomNumber, randomGreek])();
}
function generateRandomComponent() {
  let base = generateSimpleToken();
  let r = Math.random();
  if (r < 0.3) {
    base += `^{${generateSimpleToken()}}`;
  } else if (r < 0.6) {
    base += `_{${generateSimpleToken()}}`;
  }
  return base;
}
function fillTemplate(template) {
  return template.replace(/{\s*([a-z])\s*}/g, function(match, p1, offset, string) {
    const before = string.slice(0, offset).replace(/\s+$/, '');
    if (before.endsWith('^{') || before.endsWith('_{')) {
      return generateSimpleToken();
    } else {
      return generateRandomComponent();
    }
  });
}
const complexFractionTemplates = [
  "\\frac{{a} + {b}}{{c} - {d}}",
  "\\frac{{a} \\times {b} + {c}}{{d} - {e}}",
  "\\frac{{a} - {b} \\div {c}}{{d} + {e}}",
  "\\frac{{a} + {b} - {c}}{{d} + {e}}",
  "\\frac{{a} + {b}}{{c} - {d}}",
  "\\frac{{a} \\times {b} - {c}}{{d} + {e} \\times {f}}",
  "\\frac{{a} + {b}}{{c} \\times {d}}",
  "\\frac{{a} - {b}}{{c} \\times {d} + {e}}",
  "\\frac{{a} \\div {b} + {c}}{{d} - {e}}",
  "\\frac{{a} + {b} \\times {c}}{{d} + {e} \\div {f}}"
];
const simpleExpressionTemplates = [
  "( {a} + {b} - {c} )^{ {d} } + \\frac{ {e} }{ {f} }",
  "\\frac{ {a} + {b} }{ {c} } + ( {d} \\times {e} )^{ {f} }",
  "( {a} - {b} )^{ {c} } + \\frac{ {d} }{ {e} } - {f}_{ {g} }",
  "( {a} + {b} )^{ {c} } \\times {d} - \\frac{ {e} + {f} }{ {g} }",
  "\\frac{ ( {a} + {b} )^{ {c} } - {d} }{ {e} } + {f}",
  "( {a} + \\frac{ {b} }{ {c} } )^{ {d} } - ( {e} \\times {f} )_{ {g} }",
  "\\frac{ ( {a} + {b} )^{ {c} } }{ {d} } - ( {e} + {f} )_{ {g} }",
  "( {a} + {b} ) \\times \\frac{ {c} }{ {d} } - {e}",
  "\\frac{ ( {a} - {b} )^{ {c} } }{ {d} } + {e} \\times {f}",
  "( {a} + {b} )^{ {c} } + \\frac{ {d} }{ {e} } - {f}"
];
function generateComplexFraction() {
  const template = randomChoice(complexFractionTemplates);
  return fillTemplate(template);
}
function generateSimpleExpression() {
  const template = randomChoice(simpleExpressionTemplates);
  return fillTemplate(template);
}
function generateSum() {
  const lowerBound = `n=${randomNumber()}`;
  const upperBound = "i";
  return `\\sum_{${lowerBound}}^{${upperBound}} `;
}
function generateIntegral() {
  const bound = () => randomChoice([randomNumber, randomLetter, randomGreek])();
  const lowerBound = bound();
  const upperBound = bound();
  return `\\int_{${lowerBound}}^{${upperBound}} `;
}
function generateDoubleIntegral() {
  const bound = () => randomChoice([randomNumber, randomLetter, randomGreek])();
  const lowerBound = bound();
  const upperBound = bound();
  return `\\iint_{${lowerBound}}^{${upperBound}} `;
}
function generateContourIntegral() {
  const bound = () => randomChoice([randomNumber, randomLetter, randomGreek])();
  const lowerBound = bound();
  const upperBound = bound();
  return `\\oint_{${lowerBound}}^{${upperBound}} `;
}
function generateGradient() { return `\\nabla `; }
function generateDivergence() { return `\\nabla\\cdot `; }
function generateCurl() { return `\\nabla\\times `; }
function generateExpression() {
  const bigOpChoice = randomChoice([
    "sum", "integral", "double integral", "contour integral",
    "gradient", "divergence", "curl", "none"
  ]);
  let operatorPart = "";
  if (bigOpChoice === "sum") { operatorPart = generateSum(); }
  else if (bigOpChoice === "integral") { operatorPart = generateIntegral(); }
  else if (bigOpChoice === "double integral") { operatorPart = generateDoubleIntegral(); }
  else if (bigOpChoice === "contour integral") { operatorPart = generateContourIntegral(); }
  else if (bigOpChoice === "gradient") { operatorPart = generateGradient(); }
  else if (bigOpChoice === "divergence") { operatorPart = generateDivergence(); }
  else if (bigOpChoice === "curl") { operatorPart = generateCurl(); }
  
  const shellType = randomChoice(["complex", "simple"]);
  let expressionPart = (shellType === "complex")
    ? generateComplexFraction()
    : generateSimpleExpression();
  
  return { latex: operatorPart + expressionPart, math: operatorPart + expressionPart };
}

// ==================================================
// Mode Selection and Initialization
// ==================================================
// Helper function to update the visibility of the "Show Guide" button.
function updateGuideButtonVisibility() {
  const guideBtn = document.getElementById("showGuideBtn");
  // Only show the button in tutorial and learning modes.
  if (currentMode === "tutorial" || currentMode === "learning") {
    guideBtn.style.display = "inline-block"; // or "block" if you prefer.
  } else {
    guideBtn.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Mode Selection events
  document.querySelectorAll(".mode-btn").forEach(button => {
    button.addEventListener("click", () => {
      currentMode = button.getAttribute("data-mode");
      document.getElementById("modeSelectionScreen").style.display = "none";

      if (currentMode === "tutorial") {
        // Existing tutorial logic
        tutorialIndex = 0;
        currentIndex = 0;
        currentLevel = "";
        currentSubLevel = "";
        currentChallenge = "";
        endlessStreak = 0;
        document.getElementById("tutorInterface").style.display = "flex";
        renderMath();
      } else {
        // Hide the tip column in non-tutorial modes.
        if(document.querySelector(".tutor-tip")) {
          document.querySelector(".tutor-tip").style.display = "none";
        }
        document.getElementById("tutorialTip").style.display = "none";
      
        if (currentMode === "learning") {
          document.getElementById("learningLevelScreen").style.display = "flex";
          document.getElementById("bestTimesDisplay").style.display = "none";
        } else if (currentMode === "challenge") {
          document.getElementById("challengeSublevelScreen").style.display = "flex";
          document.getElementById("bestTimesDisplay").style.display = "none";
        } else if (currentMode === "endless") {
          // Instead of starting endless mode immediately,
          // display the endless mode preview.
          const bestStreak = loadBestEndlessStreak();
          document.getElementById("longestStreakDisplay").textContent = bestStreak;
          document.getElementById("endlessModeScreen").style.display = "block";
          document.getElementById("bestTimesDisplay").style.display = "none";
        }
      }
      
      // Update the "Show Guide" button visibility based on current mode.
      updateGuideButtonVisibility();
      
      loadAchievements();
      loadLearningProgress();
      loadChallengeProgress();
    });
  });




  // Learning Mode level button events
  document.querySelectorAll(".level-btn").forEach(button => {
    button.addEventListener("click", () => {
      currentLevel = button.getAttribute("data-level");
      currentIndex = 0;
      document.getElementById("learningLevelScreen").style.display = "none";
      document.getElementById("sublevelScreen").style.display = "flex";
      populateSublevelScreen();
    });
  });
  // Attach event listener to the Begin Endless Mode button.
  document.getElementById("beginEndlessMode").addEventListener("click", () => {
    // Hide the preview screen.
    document.getElementById("endlessModeScreen").style.display = "none";
    // Reset the endless streak.
    endlessStreak = 0;
    // Start endless mode.
    startEndlessMode();
  });
  // Back button from Learning Level Selection to Mode Selection
  document.getElementById("backToModeSelectionFromLearning").addEventListener("click", () => {
    document.getElementById("learningLevelScreen").style.display = "none";
    document.getElementById("modeSelectionScreen").style.display = "flex";
  });

  // Back button from Sublevel Screen (Learning Mode)
  document.getElementById("backToLearningLevelScreen").addEventListener("click", () => {
    document.getElementById("sublevelScreen").style.display = "none";
    document.getElementById("learningLevelScreen").style.display = "flex";
    currentIndex = 0;
    currentSubLevel = "";
  });

  // Back button from Tutor Interface (for all modes)
  document.getElementById("backToPrevious").addEventListener("click", () => {
    resetInputAndPreview(); // Clear input and preview first
    document.getElementById("tutorInterface").style.display = "none";
    // Hide the tutor-tip column when leaving tutor interface.
    if(document.querySelector(".tutor-tip")) {
      document.querySelector(".tutor-tip").style.display = "none";
    }
    if (currentMode === "learning") {
      document.getElementById("sublevelScreen").style.display = "flex";
    } else if (currentMode === "challenge") {
      document.getElementById("challengeSublevelScreen").style.display = "flex";
      stopChallengeTimer();
    } else if (currentMode === "endless" || currentMode === "tutorial") {
      document.getElementById("modeSelectionScreen").style.display = "flex";
    }
    currentIndex = 0;
    currentSubLevel = "";
    if (currentMode === "tutorial") {
      tutorialIndex = 0; 
    }
    document.getElementById("bestTimesDisplay").style.display = "none";
  });



  // Challenge Mode sublevel button events: show best time display.
  document.querySelectorAll(".challenge-btn").forEach(button => {
    button.addEventListener("click", () => {
      currentChallenge = button.getAttribute("data-challenge");
      challengeIndex = 0; // Reset challenge index for new challenge
      document.getElementById("challengeSublevelScreen").style.display = "none";
      document.getElementById("tutorInterface").style.display = "flex";
      startChallengeTimer();
      renderMath();
    });
  });

  // Back button from Endless Mode Preview to Mode Selection
  document.getElementById("backToModeSelectionFromEndless").addEventListener("click", () => {
    // Hide the endless mode preview screen.
    document.getElementById("endlessModeScreen").style.display = "none";
    // Show the mode selection screen.
    document.getElementById("modeSelectionScreen").style.display = "flex";
  });

  // Back button from Challenge Mode to Mode Selection
  document.getElementById("backToModeSelectionFromChallenge").addEventListener("click", () => {
    stopChallengeTimer();
    document.getElementById("challengeSublevelScreen").style.display = "none";
    document.getElementById("modeSelectionScreen").style.display = "flex";
    challengeIndex = 0;
    currentChallenge = "";
  });

  // Dark Mode Functions
  applyDarkMode();
  attachDarkModeToggle();

  // Load saved state on page load
  loadAchievements();
  loadLearningProgress();
  loadChallengeProgress();
  loadDarkMode();
  loadBestTimes();
});

// Reset All Progress Button
document.getElementById("resetProgressBtn").addEventListener("click", function() {
  if (confirm("Are you sure you want to reset all progress? This action cannot be undone.")) {
    localStorage.clear();
    achievements = {
      challengeUnder2: false,
      challengeUnder1: false,
      challengeAllUnder5: false,
      challengeAllUnder3: false,
      endless5InRow: false,
      endless10InRow: false,
      finishPhysicist: false,
      finishMathematicians: false
    };
    location.reload();
  }
});


function saveChallengeProgress() {
  localStorage.setItem("challengeProgress", JSON.stringify(completedChallenges));
}

function loadChallengeProgress() {
  const stored = JSON.parse(localStorage.getItem("challengeProgress"));
  if (stored) { Object.assign(completedChallenges, stored); }
  updateChallengeCompletion();
}

function saveLearningProgress() {
  localStorage.setItem("userProgress", JSON.stringify(completedSublevels));
}
function saveBestEndlessStreak(streak) {
  localStorage.setItem("bestEndlessStreak", streak);
}

function loadBestEndlessStreak() {
  return Number(localStorage.getItem("bestEndlessStreak")) || 0;
}

function loadLearningProgress() {
  const stored = JSON.parse(localStorage.getItem("userProgress"));
  if (stored) { 
    Object.assign(completedSublevels, stored); 
  }
  updateSublevelCompletion();
  updateLevelCompletion(); // Add this line to update level buttons on load.
}

// Updates the overlay based on what the user has typed and the guide text.
function updateOverlay() {
  const inputField = document.getElementById("inputField");
  const inputOverlay = document.getElementById("inputOverlay");
  const guideText = inputField.getAttribute("data-guide") || "";
  const typed = inputField.value;
  
  let displayHTML = "";
  if (guideText.startsWith(typed)) {
    const remaining = guideText.slice(typed.length);
    displayHTML = `<span class="typed">${typed}</span><span class="remaining">${remaining}</span>`;
  } else {
    displayHTML = `<span class="typed">${typed}</span>`;
  }
  inputOverlay.innerHTML = displayHTML;
  
  // Also update the preview below the submit button.
  updatePreview();
}


function toggleGuide() {
  // Only allow guide toggle in learning and tutorial modes.
  if (currentMode !== "tutorial" && currentMode !== "learning") {
    return;  // Do nothing if we're in challenge or endless mode.
  }

  const inputField = document.getElementById("inputField");
  const guideBtn = document.getElementById("showGuideBtn");

  if (inputField.hasAttribute("data-guide")) {
    // Guide is active; remove it.
    inputField.removeAttribute("data-guide");
    inputField.classList.remove("guide-active");
    guideBtn.textContent = "Show Guide";
    // Restore the placeholder.
    inputField.setAttribute("placeholder", "Type LaTeX syntax here...");
  } else {
    // Guide is not active; show it.
    let guideText = "";
    if (currentMode === "tutorial") {
      guideText = tutorialQuestions[tutorialIndex].latex;
    } else if (currentMode === "learning" && currentSubLevel) {
      guideText = allSublevels[currentLevel][currentSubLevel][currentIndex].latex;
    }
    inputField.setAttribute("data-guide", guideText);
    inputField.classList.add("guide-active");
    guideBtn.textContent = "Hide Guide";
    // Remove the placeholder so it doesn't show on top of the guide.
    inputField.setAttribute("placeholder", "");
  }
  
  updateOverlay();
}

document.getElementById("showGuideBtn").addEventListener("click", toggleGuide);

function updateGuideButtonVisibility() {
  const guideBtn = document.getElementById("showGuideBtn");
  if (currentMode === "tutorial" || currentMode === "learning") {
    guideBtn.style.display = "inline-block"; // or "block" as needed
  } else {
    guideBtn.style.display = "none";
  }
}

// ==================================================
// Dark Mode Functions
// ==================================================
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
}
function applyDarkMode() {
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
}
function attachDarkModeToggle() {
  document.querySelectorAll(".darkModeToggle").forEach(button => {
    button.removeEventListener("click", toggleDarkMode);
    button.addEventListener("click", toggleDarkMode);
  });
}

// ==================================================
// Latex Animation on Introduction Screen
// ==================================================
const targetLatex = "\\sum_{n=1}^{\\infty} \\frac{1}{n^{2}}";
const animationDiv = document.getElementById('latexAnimation');
const mathRendered = document.getElementById('mathRendered');
let i = 0, stage = 0;
let lastTimestamp = 0;
let delay = 100; // milliseconds between updates

function updateLatex(timestamp) {
  // Initialize lastTimestamp on first call
  if (!lastTimestamp) lastTimestamp = timestamp;

  // Only update if enough time has passed
  if (timestamp - lastTimestamp >= delay) {
    lastTimestamp = timestamp;
    
    // Update the animation text
    animationDiv.textContent = targetLatex.slice(0, i);
    const currentText = targetLatex.slice(0, i);

    if (currentText.includes("\\sum") && stage === 0) {
      mathRendered.innerHTML = "\\[\\sum\\limits_{\\mathrel{\\phantom{n=1}}}^{\\mathrel{\\phantom{\\infty}}}\\]";
      MathJax.typesetPromise();
      stage++;
    }
    if (currentText.includes("_{n") && stage === 1) {
      mathRendered.innerHTML = "\\[\\sum\\limits_{n}^{\\mathrel{\\phantom{\\infty}}}\\]";
      MathJax.typesetPromise();
      stage++;
    }
    if (currentText.includes("_{n=") && stage === 2) {
      mathRendered.innerHTML = "\\[\\sum\\limits_{n=}^{\\mathrel{\\phantom{\\infty}}}\\]";
      MathJax.typesetPromise();
      stage++;
    }
    if (currentText.includes("_{n=1}") && stage === 3) {
      mathRendered.innerHTML = "\\[\\sum_\\limits{n=1}^{\\mathrel{\\phantom{\\infty}}}\\]";
      MathJax.typesetPromise();
      stage++;
    }
    if (currentText.includes("^{\\infty}") && stage === 4) {
      mathRendered.innerHTML = "\\[\\sum_{n=1}^{\\infty}\\]";
      MathJax.typesetPromise();
      stage++;
    }
    if (currentText.includes("\\frac") && stage === 5) {
      mathRendered.innerHTML = "\\[\\sum_{n=1}^{\\infty} \\frac{}{}\\]";
      MathJax.typesetPromise();
      stage++;
    }
    if (currentText.includes("\\frac{1}") && stage === 6) {
      mathRendered.innerHTML = "\\[\\sum_{n=1}^{\\infty} \\frac{1}{}\\]";
      MathJax.typesetPromise();
      stage++;
    }
    if (currentText.includes("\\frac{1}{n") && stage === 7) {
      mathRendered.innerHTML = "\\[\\sum_{n=1}^{\\infty} \\frac{1}{n }\\]";
      MathJax.typesetPromise();
      stage++;
    }
    if (currentText.includes("\\frac{1}{n^{2}}")) {
      mathRendered.innerHTML = "\\[\\sum_{n=1}^{\\infty} \\frac{1}{n^{2}}\\]";
      MathJax.typesetPromise();
    }
    
    i++;
  }

  // If we're not done, request the next frame.
  if (i <= targetLatex.length) {
    requestAnimationFrame(updateLatex);
  } else {
    // After finishing the text, pause for 2 seconds, then reset.
    setTimeout(() => {
      i = 0;
      stage = 0;
      lastTimestamp = 0; // reset the timestamp as well
      requestAnimationFrame(updateLatex);
    }, 2000);
  }
}

// Start the animation when the window loads.
window.onload = () => {
  requestAnimationFrame(updateLatex);
};

window.MathJax = {
  options: {
    ignoreHtmlClass: "no-mathjax"
  }
};
