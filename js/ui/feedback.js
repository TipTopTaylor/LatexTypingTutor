// UI Feedback Functions
// Handles visual feedback: flashing, shaking, confetti, popups

export function flashElement(element, color = "#4CAF50") {
  const originalBg = element.style.backgroundColor;
  const originalTransition = element.style.transition;
  element.style.transition = "background-color 0.3s";
  element.style.backgroundColor = color;
  setTimeout(() => {
    element.style.backgroundColor = originalBg;
    setTimeout(() => {
      element.style.transition = originalTransition;
    }, 300);
  }, 300);
}

export function triggerConfetti() {
  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
}

export function shakeElement(element) {
  element.classList.add("shake");
  setTimeout(() => { element.classList.remove("shake"); }, 500);
}

export function showTimerPopup(message) {
  const popup = document.createElement("div");
  popup.className = "info-popup";
  popup.innerText = message;
  popup.style.opacity = "1";
  document.body.appendChild(popup);
  setTimeout(() => { popup.style.opacity = "0"; }, 6000);
  setTimeout(() => { popup.remove(); }, 7000);
}

export function resetInputAndPreview() {
  const inputField = document.getElementById("inputField");
  if (inputField) {
    inputField.value = "";
    inputField.setAttribute("placeholder", "Type LaTeX syntax here...");
  }
  const preview = document.getElementById("preview");
  if (preview) preview.innerHTML = "";
}
