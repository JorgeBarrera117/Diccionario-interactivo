import { translateText } from '../services/external.js';

let debounceTimer = null;

const LANGUAGES = [
  { code: 'en', name: 'Inglés' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Francés' },
  { code: 'de', name: 'Alemán' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Portugués' },
];

function buildLangOptions(selected) {
  return LANGUAGES.map(l =>
    `<option value="${l.code}" ${l.code === selected ? 'selected' : ''}>${l.name}</option>`
  ).join('');
}

export function renderTranslatePanel() {
  const section = document.getElementById('translateSection');
  section.innerHTML = `
    <div class="translate-panel">
      <div class="translate-header">
        <div class="translate-lang-select">
          <select id="sourceLang">${buildLangOptions('en')}</select>
        </div>
        <button class="btn swap-btn" id="swapLangBtn" title="Intercambiar idiomas">
          <i class="bi bi-arrow-left-right"></i>
        </button>
        <div class="translate-lang-select">
          <select id="targetLang">${buildLangOptions('es')}</select>
        </div>
      </div>
      <div class="translate-body">
        <div class="translate-panel-left">
          <textarea id="translateInput" placeholder="Introduce texto" rows="5"></textarea>
        </div>
        <div class="translate-panel-right">
          <div id="translateResult" class="translate-result"></div>
        </div>
      </div>
      <div class="translate-footer">
        <span id="translateChars" class="text-body-secondary">0 caracteres</span>
      </div>
    </div>
  `;

  const input = document.getElementById('translateInput');
  const result = document.getElementById('translateResult');
  const sourceLang = document.getElementById('sourceLang');
  const targetLang = document.getElementById('targetLang');
  const chars = document.getElementById('translateChars');

  input.addEventListener('input', function () {
    const text = this.value;
    chars.textContent = `${text.length} caracteres`;
    clearTimeout(debounceTimer);
    if (!text.trim()) {
      result.innerHTML = '<span class="text-body-secondary">Traducción</span>';
      return;
    }
    result.innerHTML = '<div class="translate-spinner"><div class="spinner-border spinner-border-sm text-indigo" role="status"></div> Traduciendo...</div>';
    debounceTimer = setTimeout(async () => {
      try {
        const translated = await translateText(text, sourceLang.value, targetLang.value);
        result.textContent = translated;
      } catch (err) {
        result.innerHTML = `<span class="text-danger">Error: ${err.message}</span>`;
      }
    }, 500);
  });

  document.getElementById('swapLangBtn').addEventListener('click', function () {
    const tmp = sourceLang.value;
    sourceLang.value = targetLang.value;
    targetLang.value = tmp;
    input.value = '';
    result.innerHTML = '<span class="text-body-secondary">Traducción</span>';
    chars.textContent = '0 caracteres';
  });

  sourceLang.addEventListener('change', () => {
    if (input.value.trim()) {
      input.dispatchEvent(new Event('input'));
    }
  });
  targetLang.addEventListener('change', () => {
    if (input.value.trim()) {
      input.dispatchEvent(new Event('input'));
    }
  });
}
