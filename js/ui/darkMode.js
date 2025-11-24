// Dark Mode Management

  document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
}

  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
}

  document.querySelectorAll(".darkModeToggle").forEach(button => {
    button.removeEventListener("click", toggleDarkMode);
    button.addEventListener("click", toggleDarkMode);
  });
}
