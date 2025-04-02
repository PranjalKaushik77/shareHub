// Theme toggle functionality
document.addEventListener("DOMContentLoaded", () => {
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem("theme")
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  
    // Apply theme based on saved preference or system preference
    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add("dark")
      updateThemeToggleIcon(true)
    } else {
      document.documentElement.classList.remove("dark")
      updateThemeToggleIcon(false)
    }
  
    // Add event listener to theme toggle button
    const themeToggle = document.getElementById("theme-toggle")
    if (themeToggle) {
      themeToggle.addEventListener("click", toggleTheme)
    }
  })
  
  // Toggle between light and dark themes
  function toggleTheme() {
    const isDarkMode = document.documentElement.classList.toggle("dark")
    localStorage.setItem("theme", isDarkMode ? "dark" : "light")
    updateThemeToggleIcon(isDarkMode)
  }
  
  // Update the theme toggle icon based on current theme
  function updateThemeToggleIcon(isDarkMode) {
    const themeToggle = document.getElementById("theme-toggle")
    if (themeToggle) {
      themeToggle.innerHTML = isDarkMode
        ? "☀️" // Sun icon for dark mode (to switch to light)
        : "🌙" // Moon icon for light mode (to switch to dark)
  
      // Update aria-label for accessibility
      themeToggle.setAttribute("aria-label", isDarkMode ? "Switch to light mode" : "Switch to dark mode")
    }
  }
  
  