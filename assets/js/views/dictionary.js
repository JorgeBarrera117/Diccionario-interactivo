import { escapeHtml } from '../utils/helpers.js';

const POS_MAP = {
  noun:       { es: 'Sustantivo',     hint: 'personas, animales o cosas' },
  verb:       { es: 'Verbo',          hint: 'acciones o procesos' },
  adjective:  { es: 'Adjetivo',       hint: 'cualidades o características' },
  adverb:     { es: 'Adverbio',       hint: 'modo, lugar o tiempo' },
  preposition:{ es: 'Preposición',    hint: 'relaciona palabras' },
  conjunction:{ es: 'Conjunción',     hint: 'une palabras u oraciones' },
  pronoun:    { es: 'Pronombre',      hint: 'sustituye al nombre' },
  interjection:{es: 'Interjección',   hint: 'expresa emociones' },
  determiner: { es: 'Determinante',   hint: 'artículo o posesivo' },
  numeral:    { es: 'Numeral',        hint: 'cantidad u orden' },
  abbreviation:{es: 'Abreviatura',    hint: 'forma corta' },
};

function friendlyPOS(pos) {
  if (!pos) return '';
  const key = pos.toLowerCase().trim();
  const entry = POS_MAP[key];
  if (entry) return { label: entry.es, hint: entry.hint };
  return { label: pos, hint: '' };
}

const LANG_LABELS = { en: 'Inglés', es: 'Español', fr: 'Francés', de: 'Alemán', it: 'Italiano', pt: 'Portugués' };

export function showLoading() {
  document.getElementById('loadingSection').classList.remove('d-none');
  document.getElementById('errorSection').classList.add('d-none');
  document.getElementById('resultSection').innerHTML = '';
}

export function hideLoading() {
  document.getElementById('loadingSection').classList.add('d-none');
}

export function showError(msg) {
  document.getElementById('errorSection').classList.remove('d-none');
  document.getElementById('errorSection').innerHTML = `
    <div class="alert alert-danger d-flex align-items-center gap-2" role="alert">
      <i class="bi bi-exclamation-triangle-fill"></i>
      <span>${escapeHtml(msg)}</span>
    </div>
  `;
  document.getElementById('emptyState').classList.add('d-none');
}

export function hideError() {
  document.getElementById('errorSection').classList.add('d-none');
}

function renderPronunciation(phonetics) {
  const audioUrl = phonetics.find(p => p.audio)?.audio;
  if (!audioUrl) return '';
  return `
    <button class="pronounce-btn" data-audio="${escapeHtml(audioUrl)}">
      <i class="bi bi-volume-up"></i> Escuchar
    </button>
  `;
}

export function renderWordResult(entry, isFavorite, lang, imgUrl) {
  const section = document.getElementById('resultSection');
  if (!entry) {
    section.innerHTML = '';
    return;
  }

  const langLabel = LANG_LABELS[lang] || lang.toUpperCase();

  let html = '<div class="max-w-3xl">';
  html += '<div class="word-header">';
  html += '<div>';
  html += `<h2>${escapeHtml(entry.word)}</h2>`;
  if (entry.phonetic) html += `<p class="word-phonetic">${escapeHtml(entry.phonetic)}</p>`;
  html += '</div><div class="ms-auto d-flex align-items-center gap-2">';
  html += renderPronunciation(entry.phonetics || []);
  html += `<button class="fav-btn ${isFavorite ? 'active' : ''}" data-word="${escapeHtml(entry.word)}">
    <i class="bi bi-heart${isFavorite ? '-fill' : ''}"></i>
  </button>`;
  html += '</div></div>';

  html += `<div class="mb-3"><span class="badge bg-secondary">${escapeHtml(langLabel)}</span></div>`;

  html += '<div class="row g-4">';
  html += '<div class="col-md-5 col-lg-4">';
  if (imgUrl) {
    html += `<div class="word-image-container sticky-md-top" style="top:1rem;">
      <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(entry.word)}" class="word-image" loading="lazy" />
    </div>`;
  }
  html += '</div><div class="col-md-7 col-lg-8">';

  for (const meaning of entry.meanings) {
    const pos = friendlyPOS(meaning.partOfSpeech);
    html += '<div class="card mb-3 meaning-card"><div class="card-body">';
    html += `<span class="badge text-bg-indigo mb-2">${escapeHtml(pos.label)}</span>`;
    if (pos.hint) html += `<span class="text-body-secondary ms-2" style="font-size:0.85rem;"><i class="bi bi-info-circle"></i> ${escapeHtml(pos.hint)}</span>`;
    html += '<ol class="mb-0" style="padding-left:1.25rem;">';
    for (const def of meaning.definitions) {
      html += `<li class="mb-2">${escapeHtml(def.definition)}`;
      if (def.examples && def.examples.length > 0) {
        for (const ex of def.examples) {
          html += `<div class="example-item">"${escapeHtml(ex)}"</div>`;
        }
      }
      html += '</li>';
    }
    html += '</ol></div></div>';
  }

  html += '</div></div>';
  html += '</div>';
  section.innerHTML = html;
}

export function renderWordOfDay(word, definition, lang) {
  const section = document.getElementById('wordOfDaySection');
  const title = lang === 'es' ? 'Palabra del día' : 'Word of the Day';
  section.innerHTML = `
    <div class="word-of-day-card mb-4">
      <p class="text-uppercase fw-semibold mb-1" style="font-size:0.75rem;color:#6366f1;letter-spacing:0.05em;">
        <i class="bi bi-star"></i> ${title}
      </p>
      <button class="sidebar-word-btn wod-link fs-4 fw-bold" style="color:#6366f1;" data-word="${escapeHtml(word)}">
        ${escapeHtml(word)}
      </button>
      <p class="mt-1 mb-0 text-body-secondary">${escapeHtml(definition)}</p>
    </div>
  `;
}
