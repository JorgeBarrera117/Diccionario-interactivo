const state = {
  favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
  history: JSON.parse(localStorage.getItem('history') || '[]'),
  theme: localStorage.getItem('theme') || 'light',
  language: localStorage.getItem('language') || 'en',
};

const listeners = [];

function save(key) {
  localStorage.setItem(key, JSON.stringify(state[key]));
}

function notify() {
  listeners.forEach(fn => fn(state));
}

export function subscribe(fn) {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx > -1) listeners.splice(idx, 1);
  };
}

export function getState() {
  return state;
}

export function addFavorite(word) {
  if (!state.favorites.includes(word)) {
    state.favorites.push(word);
    save('favorites');
    notify();
  }
}

export function removeFavorite(word) {
  state.favorites = state.favorites.filter(w => w !== word);
  save('favorites');
  notify();
}

export function addHistory(word) {
  const idx = state.history.findIndex(h => h.word.toLowerCase() === word.toLowerCase());
  if (idx > -1) state.history.splice(idx, 1);
  state.history.unshift({ word, timestamp: Date.now() });
  if (state.history.length > 50) state.history.pop();
  save('history');
  notify();
}

export function clearHistory() {
  state.history = [];
  save('history');
  notify();
}

export function setTheme(theme) {
  state.theme = theme;
  localStorage.setItem('theme', theme);
  notify();
}

export function toggleTheme() {
  setTheme(state.theme === 'light' ? 'dark' : 'light');
}

export function setLanguage(lang) {
  state.language = lang;
  localStorage.setItem('language', lang);
  notify();
}
