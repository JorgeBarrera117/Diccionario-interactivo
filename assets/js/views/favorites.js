import { escapeHtml } from '../utils/helpers.js';
import { getDailyWord, fetchDictionary } from '../services/external.js';
import { getState } from '../store.js';

let currentFilter = '';
let cachedDailyWord = '';
let cachedDailyDef = '';

async function fetchDailyDef(word, lang) {
  if (word === cachedDailyWord) return cachedDailyDef;
  try {
    const entry = await fetchDictionary(word, lang);
    cachedDailyWord = word;
    cachedDailyDef = entry?.meanings[0]?.definitions[0]?.definition || 'Sin definición disponible.';
  } catch {
    cachedDailyDef = 'No se pudo cargar la definición.';
  }
  return cachedDailyDef;
}

function renderHTML(state, dailyWord, dailyDef) {
  const wodFav = state.favorites.includes(dailyWord);

  const filtered = state.favorites
    .filter(w => w.toLowerCase().includes(currentFilter.toLowerCase()))
    .sort((a, b) => a.localeCompare(b));

  let html = '<div class="max-w-3xl">';

  html += `<div class="word-of-day-card mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2">`;
  html += '<div>';
  html += `<p class="text-uppercase fw-semibold mb-1" style="font-size:0.75rem;color:#6366f1;letter-spacing:0.05em;"><i class="bi bi-star"></i> Palabra del día</p>`;
  html += `<span class="fs-4 fw-bold" style="color:#6366f1;">${escapeHtml(dailyWord)}</span>`;
  html += `<p class="mt-1 mb-0 text-body-secondary small">${escapeHtml(dailyDef)}</p>`;
  html += '</div>';
  html += `<button class="fav-btn ${wodFav ? 'active' : ''}" data-word="${escapeHtml(dailyWord)}" style="font-size:1.5rem;"><span class="material-symbols-rounded${wodFav ? '-fill' : ''}">favorite_border</span></button>`;
  html += '</div>';

  html += '<div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">';
  html += '<h2 class="fw-bold mb-0 fs-4"><span class="material-symbols-rounded text-danger me-2" style="font-variation-settings: \\\'FILL\\\' 1;">favorite</span>Mis Favoritos</h2>';
  html += `<span class="badge bg-secondary">${state.favorites.length} palabra${state.favorites.length !== 1 ? 's' : ''}</span>`;
  html += '</div>';

  html += `<div class="mb-3">
    <div class="search-bar" style="border-radius:0.5rem;padding:0.2rem 0.2rem 0.2rem 1rem;">
      <span class="material-symbols-rounded search-icon">search</span>
      <input type="text" id="favSearchInput" class="search-input" placeholder="Buscar en favoritos..." value="${escapeHtml(currentFilter)}" style="font-size:0.9rem;padding:0.4rem 0.5rem;" />
      ${currentFilter ? `<button class="btn btn-sm btn-outline-secondary border-0" id="clearFavFilter" aria-label="Limpiar filtro"><span class="material-symbols-rounded">close</span></button>` : ''}
    </div>
  </div>`;

  if (filtered.length === 0) {
    html += '<p class="text-body-secondary">' + (currentFilter ? 'No hay favoritos que coincidan con tu búsqueda.' : 'No tienes favoritos aún. Busca palabras y haz clic en el <span class="material-symbols-rounded">favorite_border</span> para guardarlas aquí.') + '</p>';
  } else {
    html += '<div class="row g-3">';
    for (const word of filtered) {
      html += '<div class="col-sm-6 col-md-4">';
      html += '<div class="card meaning-card h-100">';
      html += '<div class="card-body d-flex align-items-center justify-content-between">';
      html += `<button class="sidebar-word-btn fs-5 fw-medium" data-word="${escapeHtml(word)}">${escapeHtml(word)}</button>`;
      html += `<button class="remove-fav-btn" data-word="${escapeHtml(word)}" aria-label="Eliminar favorito"><span class="material-symbols-rounded-lg">close</span></button>`;
      html += '</div></div></div>';
    }
    html += '</div>';
  }

  html += '</div>';
  return html;
}

function wireEvents(dailyWord) {
  const searchInput = document.getElementById('favSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      currentFilter = this.value;
      const st = getState();
      document.getElementById('favoritesSection').innerHTML = renderHTML(st, dailyWord, cachedDailyDef);
      wireEvents(dailyWord);
    });
  }

  const clearBtn = document.getElementById('clearFavFilter');
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      currentFilter = '';
      const st = getState();
      document.getElementById('favoritesSection').innerHTML = renderHTML(st, dailyWord, cachedDailyDef);
      wireEvents(dailyWord);
    });
  }
}

export async function renderFavorites(state, _dailyWord, filter) {
  if (filter !== undefined) currentFilter = filter;
  const sec = document.getElementById('favoritesSection');
  if (!sec) return;

  const dailyWord = _dailyWord || getDailyWord(state.language);
  const dailyDef = await fetchDailyDef(dailyWord, state.language);

  cachedDailyWord = dailyWord;
  cachedDailyDef = dailyDef;

  sec.innerHTML = renderHTML(state, dailyWord, dailyDef);
  wireEvents(dailyWord);
}
