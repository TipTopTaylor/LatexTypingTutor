// LaTeX Animation on Introduction Screen

const targetLatex = "\\sum_{n=1}^{\\infty} \\frac{1}{n^{2}}";
let i = 0, stage = 0;
let lastTimestamp = 0;
let delay = 100;

export function startLatexAnimation() {
  const animationDiv = document.getElementById('latexAnimation');
  const mathRendered = document.getElementById('mathRendered');

  if (!animationDiv || !mathRendered) return;

  function updateLatex(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;

    if (timestamp - lastTimestamp >= delay) {
      lastTimestamp = timestamp;

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

    if (i <= targetLatex.length) {
      requestAnimationFrame(updateLatex);
    } else {
      setTimeout(() => {
        i = 0;
        stage = 0;
        lastTimestamp = 0;
        requestAnimationFrame(updateLatex);
      }, 2000);
    }
  }

  requestAnimationFrame(updateLatex);
}
