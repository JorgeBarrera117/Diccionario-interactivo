import { escapeHtml } from '../utils/helpers.js';

export function renderSidebar(containerId, state) {
  const container = document.getElementById(containerId);
  if (!container) return;
  let html = '';

  html += '<section class="mb-4">';
  html += '<h6 class="text-uppercase fw-semibold text-body-secondary" style="font-size:0.75rem;letter-spacing:0.05em;">Favoritos</h6>';
  if (state.favorites.length === 0) {
    html += '<p class="text-body-secondary" style="font-size:0.85rem;">Sin favoritos aún</p>';
  } else {
    html += '<ul class="list-unstyled mb-0">';
    for (const word of state.favorites) {
      html += `<li class="d-flex align-items-center justify-content-between fav-item">
        <button class="sidebar-word-btn" data-word="${escapeHtml(word)}">${escapeHtml(word)}</button>
        <button class="remove-fav-btn" data-word="${escapeHtml(word)}"><span class="material-symbols-rounded">close</span></button>
      </li>`;
    }
    html += '</ul>';
  }
  html += '</section>';

  html += '<section>';
  html += '<div class="d-flex align-items-center justify-content-between mb-1">';
  html += '<h6 class="text-uppercase fw-semibold text-body-secondary mb-0" style="font-size:0.75rem;letter-spacing:0.05em;">Historial</h6>';
  if (state.history.length > 0) {
    html += '<button class="history-clear-btn" id="clearHistoryBtn">Limpiar</button>';
  }
  html += '</div>';
  if (state.history.length === 0) {
    html += '<p class="text-body-secondary" style="font-size:0.85rem;">Sin búsquedas aún</p>';
  } else {
    html += '<ul class="list-unstyled mb-0">';
    for (const item of state.history) {
      html += `<li><button class="sidebar-word-btn" data-word="${escapeHtml(item.word)}">${escapeHtml(item.word)}</button></li>`;
    }
    html += '</ul>';
  }
  html += '</section>';

  container.innerHTML = html;
}

export function updateSidebars(state) {
  renderSidebar('offcanvasSidebarContent', state);
}
