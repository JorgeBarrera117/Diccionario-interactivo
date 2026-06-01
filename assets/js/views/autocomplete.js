import { getSuggestions } from '../data/wordlist.js';
import { getState } from '../store.js';
import { searchWord } from '../controllers/dictionary.js';
import { escapeHtml } from '../utils/helpers.js';

let selectedIndex = -1;
let currentResults = [];

export function initAutocomplete() {
  const input = document.querySelector('[name="word"]');
  if (!input) return;

  const container = document.createElement('div');
  container.className = 'autocomplete-container';
  const parent = input.parentNode;
  const submitBtn = parent.querySelector('button');
  if (submitBtn) {
    parent.insertBefore(container, submitBtn);
  } else {
    parent.appendChild(container);
  }
  container.appendChild(input);

  const dropdown = document.createElement('div');
  dropdown.className = 'autocomplete-dropdown';
  container.appendChild(dropdown);

  let debounceTimer;
  let currentQueryId = 0;

  input.addEventListener('input', function () {
    const query = this.value.trim();
    if (query.length < 1) {
      dropdown.classList.remove('show');
      dropdown.innerHTML = '';
      currentResults = [];
      selectedIndex = -1;
      return;
    }
    
    clearTimeout(debounceTimer);
    const lang = getState().language;
    
    // Resultados locales inmediatos
    currentResults = getSuggestions(query, lang);
    selectedIndex = -1;
    renderDropdown(dropdown, currentResults, query);

    debounceTimer = setTimeout(async () => {
      const queryId = ++currentQueryId;
      try {
        const res = await fetch(`https://${lang}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=10&format=json&origin=*`);
        const data = await res.json();
        if (queryId !== currentQueryId) return; // Ignorar respuestas tardías
        if (data && data[1]) {
          const apiSuggestions = data[1].map(s => s.toLowerCase());
          currentResults = [...new Set([...currentResults, ...apiSuggestions])].slice(0, 10);
          selectedIndex = -1;
          renderDropdown(dropdown, currentResults, query);
        }
      } catch (err) {}
    }, 300);
  });

  input.addEventListener('keydown', function (e) {
    if (!dropdown.classList.contains('show') || currentResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, currentResults.length - 1);
      highlightItem(dropdown, selectedIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, -1);
      highlightItem(dropdown, selectedIndex);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      selectWord(currentResults[selectedIndex], input);
    } else if (e.key === 'Escape') {
      dropdown.classList.remove('show');
      dropdown.innerHTML = '';
      currentResults = [];
      selectedIndex = -1;
    }
  });

  input.addEventListener('blur', function () {
    setTimeout(() => {
      dropdown.classList.remove('show');
    }, 200);
  });

  input.addEventListener('focus', function () {
    if (currentResults.length > 0) {
      dropdown.classList.add('show');
    }
  });

  dropdown.addEventListener('mousedown', function (e) {
    const item = e.target.closest('.autocomplete-item');
    if (item) {
      e.preventDefault();
      selectWord(item.dataset.word, input);
    }
  });
}

function renderDropdown(dropdown, results, query) {
  if (results.length === 0) {
    dropdown.classList.remove('show');
    dropdown.innerHTML = '';
    return;
  }

  let html = '';
  for (const word of results) {
    const matchIndex = word.toLowerCase().indexOf(query.toLowerCase());
    let label = '';
    if (matchIndex >= 0) {
      const before = word.slice(0, matchIndex);
      const match = word.slice(matchIndex, matchIndex + query.length);
      const after = word.slice(matchIndex + query.length);
      label = `${escapeHtml(before)}<strong>${escapeHtml(match)}</strong>${escapeHtml(after)}`;
    } else {
      label = escapeHtml(word);
    }
    html += `<div class="autocomplete-item" data-word="${escapeHtml(word)}">${label}</div>`;
  }
  dropdown.innerHTML = html;
  dropdown.classList.add('show');
}

function highlightItem(dropdown, index) {
  const items = dropdown.querySelectorAll('.autocomplete-item');
  items.forEach((el, i) => {
    el.classList.toggle('active', i === index);
  });
  if (index >= 0 && items[index]) {
    items[index].scrollIntoView({ block: 'nearest' });
  }
}

function selectWord(word, input) {
  input.value = word;
  const dropdown = input.parentNode.querySelector('.autocomplete-dropdown');
  if (dropdown) {
    dropdown.classList.remove('show');
    dropdown.innerHTML = '';
  }
  currentResults = [];
  selectedIndex = -1;
  searchWord(word);
}


