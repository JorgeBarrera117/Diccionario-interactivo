import { getState, toggleTheme as storeToggleTheme } from '../store.js';

export function initTheme() {
  const { theme } = getState();
  document.documentElement.setAttribute('data-bs-theme', theme);
  updateThemeIcon(theme);
}

export function handleToggleTheme() {
  storeToggleTheme();
  const { theme } = getState();
  document.documentElement.setAttribute('data-bs-theme', theme);
  updateThemeIcon(theme);
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('#themeToggle i');
  if (icon) {
    icon.className = theme === 'dark' ? 'bi bi-sun-fill fs-5' : 'bi bi-moon-fill fs-5';
  }
}
