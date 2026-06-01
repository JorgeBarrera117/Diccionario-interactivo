import { escapeHtml } from '../utils/helpers.js';

const POS_MAP = {
  noun:       { es: 'Sustantivo',     hint: 'personas, animales o cosas', colorClass: 'm3-badge-noun' },
  verb:       { es: 'Verbo',          hint: 'acciones o procesos', colorClass: 'm3-badge-verb' },
  adjective:  { es: 'Adjetivo',       hint: 'cualidades o características', colorClass: 'm3-badge-adj' },
  adverb:     { es: 'Adverbio',       hint: 'modo, lugar o tiempo', colorClass: 'm3-badge-adv' },
  preposition:{ es: 'Preposición',    hint: 'relaciona palabras', colorClass: 'm3-badge-other' },
  conjunction:{ es: 'Conjunción',     hint: 'une palabras u oraciones', colorClass: 'm3-badge-other' },
  pronoun:    { es: 'Pronombre',      hint: 'sustituye al nombre', colorClass: 'm3-badge-other' },
  interjection:{es: 'Interjección',   hint: 'expresa emociones', colorClass: 'm3-badge-other' },
  determiner: { es: 'Determinante',   hint: 'artículo o posesivo', colorClass: 'm3-badge-other' },
  numeral:    { es: 'Numeral',        hint: 'cantidad u orden', colorClass: 'm3-badge-other' },
  abbreviation:{es: 'Abreviatura',    hint: 'forma corta', colorClass: 'm3-badge-other' },
};

function friendlyPOS(pos) {
  if (!pos) return '';
  const key = pos.toLowerCase().trim();
  const entry = POS_MAP[key];
  if (entry) return { label: entry.es, hint: entry.hint, colorClass: entry.colorClass };
  return { label: pos, hint: '', colorClass: 'm3-badge-other' };
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
    <button class="btn btn-icon btn-sm pronounce-btn" data-audio="${escapeHtml(audioUrl)}" title="Escuchar">
      <span class="material-symbols-rounded" style="font-size:20px;">volume_up</span>
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
  const flagLabel = lang === 'en' ? '🇺🇸 ' + langLabel : (lang === 'es' ? '🇪🇸 ' + langLabel : langLabel);

  let html = '<div class="max-w-3xl mx-auto w-100">';
  html += '<div class="d-flex justify-content-between align-items-start mb-2">';
  html += '<div>';
  html += `<h2 class="m3-display-small mb-1">${escapeHtml(entry.word)}</h2>`;
  if (entry.phonetic) {
    html += `<div class="d-flex align-items-center gap-2 m3-phonetic">`;
    html += `<span>${escapeHtml(entry.phonetic)}</span>`;
    html += renderPronunciation(entry.phonetics || []);
    html += `</div>`;
  }
  html += '</div>';
  html += `<button class="btn btn-icon fav-btn ${isFavorite ? 'active' : ''}" data-word="${escapeHtml(entry.word)}" title="Guardar">
    <span class="material-symbols-rounded ${isFavorite ? 'text-danger' : 'text-body-secondary'}" style="font-variation-settings: 'FILL' ${isFavorite ? '1' : '0'};">favorite</span>
  </button>`;
  html += '</div>';

  html += `<div class="mb-4"><span class="m3-lang-badge">${flagLabel}</span></div>`;

  // M3 Definition card
  html += '<div class="m3-def-card">';
  
  // Image inside the first meaning area if available
  let isFirst = true;

  for (const meaning of entry.meanings) {
    if (!isFirst) {
      html += '<div class="m3-divider"></div>';
    }
    
    const pos = friendlyPOS(meaning.partOfSpeech);
    html += '<div class="m3-def-section">';
    html += `<div class="d-flex flex-wrap gap-2 align-items-center mb-3">`;
    html += `<span class="m3-badge ${pos.colorClass}">${escapeHtml(pos.label)}</span>`;
    if (pos.hint) html += `<span class="m3-hint">${escapeHtml(pos.hint)}</span>`;
    html += `</div>`;

    if (isFirst && imgUrl) {
      html += `<div class="d-flex gap-3 flex-column flex-sm-row mb-3 align-items-start">`;
      html += `<img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(entry.word)}" class="m3-def-thumb shadow-sm" loading="lazy" onerror="this.style.display='none';" />`;
      html += `<div class="flex-grow-1 w-100">`;
    }

    html += '<ol class="m3-def-list">';
    for (const def of meaning.definitions) {
      html += `<li><div class="m3-def-text">${escapeHtml(def.definition)}</div>`;
      if (def.examples && def.examples.length > 0) {
        for (const ex of def.examples) {
          html += `<blockquote class="m3-example-quote">"${escapeHtml(ex)}"</blockquote>`;
        }
      }
      html += '</li>';
    }
    html += '</ol>';

    // Synonyms and Antonyms (for this meaning specifically)
    if (meaning.synonyms && meaning.synonyms.length > 0) {
      html += `<div class="mt-3"><div class="m3-section-title">Sinónimos</div>`;
      html += `<div class="m3-chips-row">`;
      meaning.synonyms.slice(0,10).forEach(s => {
        html += `<span class="m3-syn-chip sidebar-word-btn" data-word="${escapeHtml(s)}">${escapeHtml(s)}</span>`;
      });
      html += `</div></div>`;
    }
    
    if (meaning.antonyms && meaning.antonyms.length > 0) {
      html += `<div class="mt-3"><div class="m3-section-title">Antónimos</div>`;
      html += `<div class="m3-chips-row">`;
      meaning.antonyms.slice(0,10).forEach(s => {
        html += `<span class="m3-ant-chip sidebar-word-btn" data-word="${escapeHtml(s)}">${escapeHtml(s)}</span>`;
      });
      html += `</div></div>`;
    }

    if (isFirst && imgUrl) {
      html += `</div></div>`; // Close flex wrap
    }

    isFirst = false;
    html += '</div>'; // close section
  }

  html += '</div>'; // Close m3-def-card
  html += '</div>'; // Close max-w-3xl
  section.innerHTML = html;
}

export function renderWordOfDay(word, definition, lang) {
  const section = document.getElementById('wordOfDaySection');
  const title = lang === 'es' ? 'Palabra del día' : 'Word of the Day';
  section.innerHTML = `
    <div class="m3-wod-card mx-auto mb-4 position-relative overflow-hidden" style="max-width: 800px;">
      <div class="d-flex w-100 position-relative z-1">
        <div class="flex-grow-1 pe-4">
          <div class="m3-wod-label">${title}</div>
          <button class="m3-wod-word sidebar-word-btn text-start p-0 border-0 bg-transparent" data-word="${escapeHtml(word)}">
            ${escapeHtml(word)}
          </button>
          <div class="m3-wod-def mt-2">${escapeHtml(definition)}</div>
          <button class="btn btn-sm btn-link text-primary text-decoration-none p-0 mt-3 fw-medium sidebar-word-btn" data-word="${escapeHtml(word)}">Ver más</button>
        </div>
        <div class="d-none d-sm-flex align-items-center justify-content-center px-4" style="color: var(--md-sys-color-primary, #6750A4); opacity: 0.15;">
          <span class="material-symbols-rounded" style="font-size: 64px;">auto_stories</span>
        </div>
      </div>
      <div class="position-absolute top-0 end-0 p-3 z-2 d-flex gap-1">
        <button class="btn btn-icon btn-sm text-primary fav-btn" data-word="${escapeHtml(word)}" title="Guardar">
          <span class="material-symbols-rounded">star</span>
        </button>
      </div>
    </div>
  `;
}
