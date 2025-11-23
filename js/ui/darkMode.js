// Dark Mode Management

export function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
}

export function applyDarkMode() {
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
}

export function attachDarkModeToggle() {
  document.querySelectorAll(".darkModeToggle").forEach(button => {
    button.removeEventListener("click", toggleDarkMode);
    button.addEventListener("click", toggleDarkMode);
  });
}
