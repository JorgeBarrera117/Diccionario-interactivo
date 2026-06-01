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
  const icon = document.querySelector('#themeIcon');
  if (icon) {
    icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
  }
}
