import { getState, subscribe, addFavorite, removeFavorite, clearHistory, setLanguage } from './store.js';
import { searchWord, loadWordOfDay } from './controllers/dictionary.js';
import { initTheme, handleToggleTheme } from './controllers/theme.js';
import { updateSidebars } from './views/sidebar.js';
import { renderTranslatePanel } from './views/translate.js';
import { renderFavorites } from './views/favorites.js';
import { renderMathPanel, renderPhysicsSection, renderChemistrySection } from './views/math.js';
import { initAutocomplete } from './views/autocomplete.js';

let currentSection = 'dictionary';

async function setActiveSection(section) {
  currentSection = section;
  document.querySelectorAll('.section-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.section === section);
  });
  const sections = ['dictionary', 'translate', 'favorites', 'math', 'physics', 'chemistry'];
  sections.forEach(s => {
    const el = document.getElementById(s + 'Section');
    if (s === section) {
      el.classList.remove('d-none');
      el.classList.add('fade-section');
      // Reiniciar animación
      el.style.animation = 'none';
      el.offsetHeight; /* trigger reflow */
      el.style.animation = null; 
    } else {
      el.classList.add('d-none');
      el.classList.remove('fade-section');
    }
  });
  if (section === 'favorites') await renderFavorites(getState());
}

const LANG_NAMES = {
  en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch', it: 'Italiano', pt: 'Português',
};
const LANG_CHIP_NAMES = {
  en: '🇺🇸 EN', es: '🇪🇸 ES', fr: '🇫🇷 FR', de: '🇩🇪 DE', it: '🇮🇹 IT', pt: '🇵🇹 PT',
};
const LANG_PLACEHOLDERS = {
  en: 'Search for a word in English...',
  es: 'Buscar una palabra en español...',
  fr: 'Rechercher un mot en français...',
  de: 'Ein Wort auf Deutsch suchen...',
  it: 'Cerca una parola in italiano...',
  pt: 'Pesquise uma palavra em português...',
};
const LANG_EMPTY = {
  en: 'Search for a word in English to see its definition',
  es: 'Busca una palabra en español para ver su definición',
  fr: 'Recherchez un mot en français pour voir sa définition',
  de: 'Suchen Sie ein Wort auf Deutsch, um die Definition zu sehen',
  it: 'Cerca una parola in italiano per vedere la definizione',
  pt: 'Pesquise uma palavra em português para ver a definição',
};
const LANG_SEARCH_BTN = {
  en: 'Search', es: 'Buscar', fr: 'Rechercher', de: 'Suchen', it: 'Cerca', pt: 'Pesquisar',
};
const LANG_EXAMPLES = {
  en: 'Ej: dog, house, love, tree, book',
  es: 'Ej: casa, amor, árbol, libro, sol',
  fr: 'Ex: maison, amour, arbre, livre, soleil',
  de: 'z.B. Haus, Liebe, Baum, Buch, Sonne',
  it: 'Es: casa, amore, albero, libro, sole',
  pt: 'Ex: casa, amor, árvore, livro, sol',
};

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function updateLangUI(lang) {
  const label = document.getElementById('currentLangLabel');
  if (label) label.textContent = LANG_CHIP_NAMES[lang] || lang;

  const input = document.querySelector('[name="word"]');
  if (input) input.placeholder = LANG_PLACEHOLDERS[lang] || 'Search a word...';

  const empty = document.getElementById('emptyStateText');
  if (empty) empty.textContent = LANG_EMPTY[lang] || 'Search for a word to see its definition';

  const searchBtn = document.querySelector('.search-btn');
  if (searchBtn) searchBtn.textContent = LANG_SEARCH_BTN[lang] || 'Search';

  const hint = document.getElementById('emptyStateHint');
  if (hint) hint.textContent = LANG_EXAMPLES[lang] || LANG_EXAMPLES.en;
}

function setupEventListeners(offcanvas) {
  document.getElementById('themeToggle').addEventListener('click', handleToggleTheme);

  document.querySelectorAll('.lang-option').forEach(el => {
    el.addEventListener('click', function () {
      const lang = this.dataset.lang;
      if (lang !== getState().language) {
        setLanguage(lang);
        updateLangUI(lang);
        document.getElementById('resultSection').innerHTML = '';
        document.getElementById('errorSection').classList.add('d-none');
        loadWordOfDay();
      }
      const toggle = document.getElementById('langToggle');
      const dd = bootstrap.Dropdown.getInstance(toggle);
      if (dd) dd.hide();
    });
  });

  document.querySelectorAll('.section-tab').forEach(tab => {
    tab.addEventListener('click', function () {
      const section = this.dataset.section;
      if (section !== currentSection) {
        setActiveSection(section);
      }
      const bsCollapse = bootstrap.Collapse.getInstance(document.getElementById('navSections'));
      if (bsCollapse) bsCollapse.hide();
    });
  });

  const searchForm = document.getElementById('searchForm');
  const searchInput = searchForm.querySelector('[name="word"]');
  
  searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const word = searchInput.value.trim();
    if (word) {
      searchWord(word);
    }
  });

  searchInput.addEventListener('input', function (e) {
    const word = this.value.trim();
    if (word.length === 0) {
      document.getElementById('resultSection').innerHTML = '';
      document.getElementById('errorSection').classList.add('d-none');
      document.getElementById('emptyState').classList.remove('d-none');
    }
  });

  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.fav-btn');
    if (btn) {
      const word = btn.dataset.word;
      if (getState().favorites.includes(word)) {
        removeFavorite(word);
        btn.classList.remove('active');
        const icon = btn.querySelector('span');
        if (icon) {
          icon.textContent = 'favorite_border';
          icon.style.fontVariationSettings = "'FILL' 0";
        }
      } else {
        addFavorite(word);
        btn.classList.add('active');
        const icon = btn.querySelector('span');
        if (icon) {
          icon.textContent = 'favorite';
          icon.style.fontVariationSettings = "'FILL' 1";
        }
      }
      return;
    }

    const wordBtn = e.target.closest('.sidebar-word-btn');
    if (wordBtn) {
      searchWord(wordBtn.dataset.word);
      offcanvas.hide();
      return;
    }

    const removeBtn = e.target.closest('.remove-fav-btn');
    if (removeBtn) {
      removeFavorite(removeBtn.dataset.word);
      return;
    }

    const clearBtn = e.target.closest('#clearHistoryBtn');
    if (clearBtn) {
      clearHistory();
      return;
    }

    const pronounceBtn = e.target.closest('.pronounce-btn');
    if (pronounceBtn) {
      const audio = new Audio(pronounceBtn.dataset.audio);
      audio.currentTime = 0;
      audio.play().catch(() => {});
      return;
    }

    const wodLink = e.target.closest('.wod-link');
    if (wodLink) {
      searchWord(wodLink.dataset.word);
      return;
    }
  });

}

function init() {
  initTheme();

  const offcanvasEl = document.getElementById('sidebarOffcanvas');
  const offcanvas = new bootstrap.Offcanvas(offcanvasEl);


  updateLangUI(getState().language);
  setupEventListeners(offcanvas);
  initAutocomplete();

  subscribe(async () => {
    const st = getState();
    updateSidebars(st);
    if (currentSection === 'favorites') await renderFavorites(st);
  });

  loadWordOfDay();
  renderFavorites(getState());
  renderTranslatePanel();
  renderMathPanel();
  renderPhysicsSection();
  renderChemistrySection();
  updateSidebars(getState());
}

document.addEventListener('DOMContentLoaded', init);
