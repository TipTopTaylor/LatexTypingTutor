// Math Rendering System
// Handles tokenization, grouping, and rendering of LaTeX expressions

import { getShell } from '../utils/helpers.js';
import { allSublevels } from '../data/levelData.js';
import { challengeSublevels } from '../data/challengeData.js';
import { tutorialQuestions } from '../data/tutorialData.js';

// Tutorial state (will be moved to state management later)
let tutorialMultiplicationTipShown = false;
let tutorialFractionTipShown = false;

export function tokenizeLatex(input) {
  const tokens = [];
  let i = 0;

  function readCommand() {
    let command = '\\';
    i++;
    if (i < input.length && !/[a-zA-Z]/.test(input[i])) {
      command += input[i];
      i++;
      return command;
    }
    while (i < input.length && /[a-zA-Z]/.test(input[i])) {
      command += input[i];
      i++;
    }
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

    if ((["\\hat", "\\mathbf", "\\text", "\\sqrt", "\\mathcal"].includes(command)) && input[i] === '{') {
      command += readGroup();
    }
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

export function groupTokens(tokens) {
  const grouped = [];
  let i = 0;
  while (i < tokens.length) {
    let token = tokens[i];
    if (token.startsWith("\\left")) {
      let group = token;
      i++;
      while (i < tokens.length && !tokens[i].startsWith("\\right")) {
        group += tokens[i];
        i++;
      }
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

export function renderMath(currentMode, currentLevel, currentSubLevel, currentIndex, currentChallenge, challengeIndex, tutorialIndex, currentExpression, updateProgress, updateTutorialTip) {
  const mathContainer = document.getElementById("math-display-container");
  mathContainer.innerHTML = "";

  function renderToken(token, custom = false, mode = null) {
    const tokenEl = document.createElement("span");
    tokenEl.className = "token";
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
    if (!custom) {
      tokenEl.addEventListener("mouseover", () => {
        document.getElementById("syntaxHintContainer").textContent = getShell(token) || token;
      });
      tokenEl.addEventListener("mouseout", () => {
        document.getElementById("syntaxHintContainer").textContent = "";
      });
    }
    if (mode !== "challenge" && mode !== "endless") {
      tokenEl.addEventListener("click", () => {
        document.getElementById("inputField").value += token;
        window.updatePreview();
      });
    }
    return tokenEl;
  }

  function renderTokenWithHandler(token, handler) {
    const tokenEl = renderToken(token, true, currentMode);
    handler(token, tokenEl);
    return tokenEl;
  }

  function renderExpression(expr, tokenHandler) {
    let tokens = tokenizeLatex(expr.math);
    tokens = groupTokens(tokens);
    tokens.forEach(token => {
      const tokenEl = tokenHandler
        ? renderTokenWithHandler(token, tokenHandler)
        : renderToken(token, false, currentMode);
      mathContainer.appendChild(tokenEl);
    });

    MathJax.typesetPromise();
  }

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

export function resetTutorialTipState() {
  tutorialMultiplicationTipShown = false;
  tutorialFractionTipShown = false;
}
