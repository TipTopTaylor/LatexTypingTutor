// Utility Helper Functions

export function getShell(token) {
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
  }

  if (token.startsWith('^')) return '^{}';
  if (token.startsWith('_')) return '_{}';

  return token;
}

export function playSound(audio) {
  audio.currentTime = 0;
  audio.play().catch(err => console.log("Error playing sound:", err));
}
